/**
 * @module classes
 */

import { request } from "../requests.js";
import { load } from "cheerio";
import Client from "./Client.js";
import Forum from "./Forum.js";
import { DEFAULT_UP_DELAY, FORUMS_APP_REGEX, HTTP_CODES, MINIMAL_UP_DELAY, POST_MODERATION_URL, POST_URL, RESOLVE_TOPIC_URL, SECOND_DELAY, SELECTORS, TOPIC_MODERATION_URL, TOPIC_POST_URL } from "../vars.js";
import { JvcErrorMessage, ValueError } from "../errors.js";
import Topic from "./Topic.js";
import Post from "./Post.js";
import { sleep } from "../utils.js";
import { JVCTypes, LibTypes } from "../types/index.js";

/**
 * Classe permettant à l'aide d'un {@link Client} connecté d'interagir avec les forums de JVC.
 *
 */
export default class ForumClient {
    private _client: Client;
    private _interval: undefined | NodeJS.Timeout;

    /**
     * Crée une instance de `ForumClient`.
     * @param {Client} client client connecté
     */
    constructor(client: Client) {
        this._client = client;
        this._interval = undefined;
    }

    /**
     *
     * @hidden
     * @private
     * @param {Response} response
     */
    private static async detectJvcErrors(response: Response): Promise<void> {
        try {
            const data = await response.clone().json();
            if (data.errors) {
                let errors = [""];
                for (const [_, err] of Object.entries(data.errors)) {
                    errors.push(err as string);
                }
                throw new JvcErrorMessage(errors.join(" "));
            } 
        } catch (e) {
            if (e instanceof SyntaxError) {

            } else {
                throw e;
            }
        }
    }

    /**
     * Poste un topic sur le forum concerné et renvoie l'objet {@link Topic} correspondant.
     *
     * @param {Forum} forum
     * @param {string} title titre du topic
     * @param {string} body corps du topic
     * @param {LibTypes.Args.ForumClient.PostTopicOptions} [options] 
     * @param {LibTypes.Args.ForumClient.Poll} [options.poll] sondage optionnel que l'on peut poster avec le topic
     * @throws {@link errors.NotConnected | `NotConnected`} si le client n'est pas connecté
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le forum n'existe pas
     * @throws {@link errors.JvcErrorMessage | `JvcErrorMessage`} si le texte n'est pas valide
     * @return {Promise<Topic>}
     */
    postTopic(forum: Forum, title: string, body: string, options?: LibTypes.Args.ForumClient.PostTopicOptions): Promise<Topic>;
    async postTopic(forum: Forum, title: string, body: string, { poll }: LibTypes.Args.ForumClient.PostTopicOptions = {}) {
        this._client.assertConnected();

        const inputsRes = await request(forum.url, { cookies: this._client.session, curl: true });
        forum._rejectIfNonexistent(inputsRes);
        const preData = (await this.getFormData(inputsRes))!;
        const data = {
            topicTitle: title,
            submitSurvey: false,
            answerSurvey: "",
            "responsesSurvey[]": [""],
            text: body,
            topicId: 0,
            forumId: preData.forumId,
            group: 1,
            messageId: "undefined",
            ...preData.formSession,
            ajax_hash: preData.ajaxToken
        };

        if (poll) {
            data.submitSurvey = true;
            data.answerSurvey = poll.title;
            data["responsesSurvey[]"] = poll.answers;
        }

        const response = await request(TOPIC_POST_URL, { method: "POST", cookies: this._client.session, data, bodyMode: "form", curl: true });
        const responseClone = response.clone()
        await ForumClient.detectJvcErrors(response);

        const redirectUrl = (await responseClone.json()).redirectUrl;
        return new Topic(Topic._getIdFromUrl(redirectUrl));
    }

    /**
     * @hidden
     * @param res 
     * @returns 
     */
    private async getFormData(res: Response): Promise<JVCTypes.FormData | undefined> {
        const $ = load(await res.text());
        const script = $(SELECTORS["forumsApp"]);
        const match = script!.html()!.match(FORUMS_APP_REGEX);

        if (match && match[1]) {
            const decodedBuffer = Buffer.from(match[1], "base64");
            const decodedString = decodedBuffer.toString("utf-8");
            return JSON.parse(decodedString);
        };

        return undefined;
    }

    /**
     * Poste un message sur le topic concerné. Nécessite un client connecté.
     *
     * @param {Topic} topic
     * @param {string} text corps du message
     * @throws {@link errors.NotConnected | `NotConnected`} si le client n'est pas connecté
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le topic n'existe pas
     * @throws {@link errors.JvcErrorMessage | `JvcErrorMessage`} si le texte n'est pas valide
     * @return {Promise<Post>}
     */
    async postMessage(topic: Topic, text: string): Promise<Post> {
        this._client.assertConnected();

        const inputsRes = await request(topic.url, { cookies: this._client.session, curl: true });
        topic._rejectIfNonexistent(inputsRes);
        const preData = (await this.getFormData(inputsRes))!;
        const data = {
            text,
            topicId: preData.topicId,
            forumId: preData.forumId,
            group: 1,
            ...preData.formSession,
            ajax_hash: preData.ajaxToken,
            messageId: "undefined"
        };

        const response = await request(POST_URL, { method: "POST", cookies: this._client.session, data, bodyMode: "form", curl: true });
        await ForumClient.detectJvcErrors(response);

        const result = await response.json() as { redirectUrl: string };
        const postId = parseInt(result.redirectUrl.split("_").pop()!);
        return new Post(postId);
    }

    /**
     * Permet de *up* un topic en postant à intervalles réguliers.
     * 
     * @param topic
     * @param text corps des messages
     * @throws {@link errors.NotConnected | `NotConnected`} si le client n'est pas connecté
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le topic n'existe pas
     * @throws {@link errors.ValueError | `ValueError`} si le délai spécifié est invalide
     * @param {LibTypes.Args.ForumClient.UpOptions} [options]
     * @param { number } [options.delay] délai entre chaque *up* en secondes (par défaut `25`, ne peut être en dessous de `15`)
     * @param {{callback?: (post: Post) => any}} [options.callback] fonction à appeler sur un *up*, par défaut supprime le *up*
     */
     async up(topic: Topic, text: string, { delay = DEFAULT_UP_DELAY, callback = undefined }: LibTypes.Args.ForumClient.UpOptions = {}): Promise<void> {
        this._client.assertConnected();
        topic._rejectIfNonexistent(await request(topic.url, { curl: true }));
        
        if (delay < MINIMAL_UP_DELAY) {
            throw new ValueError(`Up delay must be greater than ${MINIMAL_UP_DELAY} seconds.`);
        }

        if (!callback) {
            callback = async (post: Post) => await this.deletePost(post);
        }

        let post: Post | undefined = undefined;

        this._interval = setInterval(async () => { 
            if (post) {
                await callback(post);
            }
            await sleep(SECOND_DELAY / 2);
            post = await this.postMessage(topic, text);
        }, delay * 1000);
    }

    /**
     * Arrête le *up* en cours d'un topic (voir {@link ForumClient.up | `ForumClient.up`}). Si pas de *up* en cours, ne fait rien.
     */
    stopUp(): void {
        if (this._interval) {
            clearInterval(this._interval);
            this._interval = undefined;
        }
    }

    private async detectAjaxError(response: Response): Promise<void> {
        const dataRes: { erreur: string[] } = await response.json();

        if (dataRes.erreur.length > 0) {
            throw new JvcErrorMessage(dataRes.erreur[0]);
        }
    }

    /**
     * Supprime le post.
     *
     * @param {Post} post
     * @return {Promise<void>}
     * @throws {@link errors.NotConnected | `NotConnected`} si le client n'est pas connecté
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le post n'existe pas
     * @throws {@link errors.JvcErrorMessage | `JvcErrorMessage`} si le post n'appartient pas au compte
     */
    async deletePost(post: Post): Promise<void> {
        this._client.assertConnected();

        const hashRes = await request(post.url, { cookies: this._client.session, curl: true, allowedStatusErrors: [HTTP_CODES.NOT_FOUND, HTTP_CODES.GONE] });

        post._rejectIfNonexistent(hashRes);

        const $ = load(await hashRes.text());
        const hash = $(SELECTORS["hashModeration"]).attr("value")!;
        const data = {
            "tab_message[]": post.id,
            "type": "delete",
            "ajax_hash": hash
        }

        const response = await request(POST_MODERATION_URL, { method: "POST", cookies: this._client.session, data, bodyMode: "url", curl: true });
        await this.detectAjaxError(response);
    }

    /**
     * Supprime le topic.
     *
     * @param {Topic} topic
     * @throws {@link errors.NotConnected | `NotConnected`} si le client n'est pas connecté
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le topic n'existe pas
     * @throws {@link errors.JvcErrorMessage | `JvcErrorMessage`} si le topic n'appartient pas au compte
     * @return {Promise<void>}
     */
    async deleteTopic(topic: Topic): Promise<void> {
        this._client.assertConnected();

        const firstPost = await topic.getFirstPost();
        await this.deletePost(firstPost);
    }

    /**
     * Change l'état de résolution du topic (résolu -> non-résolu ou non-résolu -> résolu).
     *
     * @param {Topic} topic
     * @throws {@link errors.NotConnected | `NotConnected`} si le client n'est pas connecté
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le topic n'existe pas
     * @throws {@link errors.JvcErrorMessage | `JvcErrorMessage`} si le topic n'appartient pas au compte
     * @return {Promise<void>}
     */
    async toggleTopicResolution(topic: Topic): Promise<void> {
        this._client.assertConnected();

        const hashRes = await request(topic.url, { cookies: this._client.session, curl: true });

        topic._rejectIfNonexistent(hashRes);

        const $ = load(await hashRes.text());
        const hash = $(SELECTORS["hashMessage"]).attr("value")!;
        const data = {
            "id_topic": topic.id,
            "ajax_hash": hash
        };

        const response = await request(RESOLVE_TOPIC_URL, { method: "POST", data, cookies: this._client.session, bodyMode: "url", curl: true });
        await this.detectAjaxError(response);
    }

    /**
     * Bloque le topic avec la raison passée en entrée.
     *
     * @param {Topic} topic
     * @param {string} reason raison du lock
     * @throws {@link errors.NotConnected | `NotConnected`} si le client n'est pas connecté
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le topic n'existe pas
     * @throws {@link errors.JvcErrorMessage | `JvcErrorMessage`} si le topic n'appartient pas au compte
     * @return {Promise<void>}
     */
    async lockTopic(topic: Topic, reason: string): Promise<void> {
        this._client.assertConnected();

        const hashRes = await request(topic.url, { cookies: this._client.session, curl: true });
        topic._rejectIfNonexistent(hashRes);

        const $ = load(await hashRes.text());
        const hash = $(SELECTORS["hashModeration"]).attr("value")!;
        const data = {
            "id_forum": Forum._getIdFromURL(hashRes.url),
            "tab_topic[]": topic.id,
            "type": "lock",
            "ajax_hash": hash,
            "raison_moderation": reason,
            "action": "post"
        };

        const response = await request(TOPIC_MODERATION_URL, { method: "POST", cookies: this._client.session, data, bodyMode: "url", curl: true });
        await this.detectAjaxError(response);
    }
}