/**
 * @module classes
 */

import { curl } from "../requests.js";
import { load } from "cheerio";
import Client from "./Client.js";
import Forum from "./Forum.js";
import { DEFAULT_UP_DELAY, MINIMAL_UP_DELAY, POST_MODERATION_URL, RESOLVE_TOPIC_URL, SECOND_DELAY, SELECTORS, TOPIC_MODERATION_URL } from "../vars.js";
import { JvcErrorMessage } from "../errors.js";
import Topic from "./Topic.js";
import Post from "./Post.js";
import { sleep } from "../utils.js";

/**
 * Classe permettant à l'aide d'un {@link Client} connecté d'interagir avec les forums de JVC.
 *
 */
export default class ForumClient {
    private _client: Client;
    private _interval: NodeJS.Timeout | null;

    /**
     * Crée une instance de `ForumClient`.
     * @param {Client} client client connecté
     */
    constructor(client: Client) {
        this._client = client;
        this._interval = null;
    }

    /**
     *
     * @hidden
     * @private
     * @param {cheerio.Root} $
     */
    private static detectJvcErrors($: cheerio.Root): void {
        const alert = $(SELECTORS["alert"]);

        if (alert.length > 0) {
            throw new JvcErrorMessage(alert.text().trim());
        }

        const warning = $(SELECTORS["warning"]);

        if (warning.length > 0) {
            throw new JvcErrorMessage(warning.text().trim());
        }
    }

    /**
     * Poste un topic sur le forum concerné et renvoie l'objet {@link Topic} correspondant.
     *
     * @param {Forum} forum
     * @param {string} title titre du topic
     * @param {string} body corps du topic
     * @param {{ poll?: JVCTypes.ForumClient.Poll }} [options] 
     * @param {JVCTypes.ForumClient.Poll} [options.poll] sondage optionnel que l'on peut poster avec le topic
     * @throws {@link errors.InexistentContent | NotConnected} si le client n'est pas connecté
     * @throws {@link errors.InexistentContent | InexistentContent} si le forum n'existe pas
     * @throws {@link errors.InexistentContent | JvcErrorMessage} si le texte n'est pas valide
     * @return {Promise<Topic>}
     */
    postTopic(forum: Forum, title: string, body: string, options?: { poll?: JVCTypes.ForumClient.Poll }): Promise<Topic>;
    async postTopic(forum: Forum, title: string, body: string, { poll }: { poll?: JVCTypes.ForumClient.Poll } = {}) {
        this._client.assertConnected();

        const inputsRes = await curl(forum.url, { cookies: this._client.session });
        const $ = load(await inputsRes.text());
        const inputs = $(SELECTORS["forum-inputs"]);
        const data: Record<string, string | string[]> = Object.fromEntries(inputs.get().map((x) => [$(x).attr("name")!, $(x).attr("value")!]));
        
        data["g-recaptcha-response"] = "";
        data["form_alias_rang"] = "1";
        data["titre_topic"] = title;
        data["message_topic"] = body;

        if (poll) {
            data["question_sondage"] = poll.title;
            data["reponse_sondage[]"] = poll.answers;
            data["submit_sondage"] = "1";
        }

        const response = await curl(inputsRes.url, { method: "POST", cookies: this._client.session, data, headers: { "content-type": "application/x-www-form-urlencoded" } });
        const $2 = load(await response.text());
        ForumClient.detectJvcErrors($2);

        return new Topic(Topic._getIdFromUrl(response.url));
    }

    /**
     * Poste un message sur le topic concerné. Nécessite un client connecté.
     *
     * @param {Topic} topic
     * @param {string} text corps du message
     * @throws {@link errors.InexistentContent | NotConnected} si le client n'est pas connecté
     * @throws {@link errors.InexistentContent | InexistentContent} si le topic n'existe pas
     * @throws {@link errors.InexistentContent | JvcErrorMessage} si le texte n'est pas valide
     * @return {Promise<Post>}
     */
    async postMessage(topic: Topic, text: string): Promise<Post> {
        this._client.assertConnected();

        const inputsRes = await curl(topic.url, { cookies: this._client.session });
        const $ = load(await inputsRes.text());
        const inputs = $(SELECTORS["forum-inputs"]);
        const data: Record<string, string | string[]> = Object.fromEntries(inputs.get().map((x) => [$(x).attr("name")!, $(x).attr("value")!]));
        
        data["g-recaptcha-response"] = "";
        data["form_alias_rang"] = "1";
        data["message_topic"] = text;

        const response = await curl(inputsRes.url, { method: "POST", cookies: this._client.session, data, headers: { "content-type": "application/x-www-form-urlencoded" } });
        const $2 = load(await response.text());
        ForumClient.detectJvcErrors($2);

        const postId = parseInt(response.url.split("_").pop()!);
        return new Post(postId);
    }

    /**
     * Permet de *up* un topic, en postant puis supprimant les *ups* au fur et à mesure.
     * 
     * @param topic
     * @param text corps des messages
     * @throws {@link errors.InexistentContent | NotConnected} si le client n'est pas connecté
     * @throws {@link errors.InexistentContent | InexistentContent} si le topic n'existe pas
     * @throws {@link !Error} si le délai est strictement inférieur à 15
     * @param { delay?: number } [options]
     * @param { number } [options.delay] délai entre chaque *up* en secondes (par défaut 25, ne peut être en dessous de 15)
     */
    up(topic: Topic, text: string, { delay = DEFAULT_UP_DELAY }: { delay?: number } = {}): void {
        if (delay < MINIMAL_UP_DELAY) {
            throw new Error(`Up delay must be greater than ${MINIMAL_UP_DELAY} seconds.`);
        }

        let post: Post | undefined = undefined;

        this._interval = setInterval(async () => { 
            if (post) {
                await this.deletePost(post);
            }
            await sleep(SECOND_DELAY / 2);
            post = await this.postMessage(topic, text);
        }, delay * 1000);
    }

    /**
     * Arrête le *up* en cours d'un topic (voir {@link ForumClient.up}). Si pas de *up* en cours, ne fait rien.
     */
    stopUp(): void {
        if (this._interval) {
            clearInterval(this._interval)
            this._interval = null;
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
     * @throws {@link errors.InexistentContent | NotConnected} si le client n'est pas connecté
     * @throws {@link errors.InexistentContent | InexistentContent} si le post n'existe pas
     * @throws {@link errors.InexistentContent | JvcErrorMessage} si le post n'appartient pas au compte
     */
    async deletePost(post: Post): Promise<void> {
        this._client.assertConnected();

        const hashRes = await curl(post.url, { cookies: this._client.session });

        post._rejectIfInexistent(hashRes);

        const $ = load(await hashRes.text());
        const hash = $(SELECTORS["hashModeration"]).attr("value")!;
        const data = {
            "tab_message[]": post.id,
            "type": "delete",
            "ajax_hash": hash
        }

        const response = await curl(POST_MODERATION_URL, { method: "POST", cookies: this._client.session, headers: { "content-type": "application/x-www-form-urlencoded" }, data });
        this.detectAjaxError(response);
    }

    /**
     * Supprime le topic.
     *
     * @param {Topic} topic
     * @throws {@link errors.InexistentContent | NotConnected} si le client n'est pas connecté
     * @throws {@link errors.InexistentContent | InexistentContent} si le topic n'existe pas
     * @throws {@link errors.InexistentContent | JvcErrorMessage} si le topic n'appartient pas au compte
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
     * @throws {@link errors.InexistentContent | NotConnected} si le client n'est pas connecté
     * @throws {@link errors.InexistentContent | InexistentContent} si le topic n'existe pas
     * @throws {@link errors.InexistentContent | JvcErrorMessage} si le topic n'appartient pas au compte
     * @return {Promise<void>}
     */
    async toggleTopicResolution(topic: Topic): Promise<void> {
        this._client.assertConnected();

        const hashRes = await curl(topic.url, { cookies: this._client.session });

        topic._rejectIfInexistent(hashRes);

        const $ = load(await hashRes.text());
        const hash = $(SELECTORS["hashMessage"]).attr("value")!;
        const data = {
            "id_topic": topic.id,
            "ajax_hash": hash
        };

        const response = await curl(RESOLVE_TOPIC_URL, { method: "POST", data, cookies: this._client.session, headers: { "content-type": "application/x-www-form-urlencoded" } });
        this.detectAjaxError(response);
    }

    /**
     * Bloque le topic avec la raison passée en entrée.
     *
     * @param {Topic} topic
     * @param {string} reason raison du lock
     * @throws {@link errors.InexistentContent | NotConnected} si le client n'est pas connecté
     * @throws {@link errors.InexistentContent | InexistentContent} si le topic n'existe pas
     * @throws {@link errors.InexistentContent | JvcErrorMessage} si le topic n'appartient pas au compte
     * @return {Promise<void>}
     */
    async lockTopic(topic: Topic, reason: string): Promise<void> {
        this._client.assertConnected();

        const hashRes = await curl(topic.url, { cookies: this._client.session });
        topic._rejectIfInexistent(hashRes);

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

        const response = await curl(TOPIC_MODERATION_URL, { method: "POST", cookies: this._client.session, headers: { "content-type": "application/x-www-form-urlencoded" }, data });
        this.detectAjaxError(response);
    }
}