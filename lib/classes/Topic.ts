/**
 * @module classes
 */

import { InexistentContent } from "../errors.js";
import { curl } from "../requests.js";
import { API_DOMAIN, DOMAIN, FORUMS_PAGE, HTTP_CODES, POLL_SELECTORS, SECOND_DELAY, TOPIC_POST_SELECTORS, TOPIC_SELECTORS, URL_PLACEHOLDER } from "../vars.js";
import Forum from "./Forum.js";
import { load } from "cheerio";
import { checkInteger, convertJVCStringToDate, sleep } from "../utils.js";
import JVCode from "../scrapers/JVCode.js";
import Post from "./Post.js";
import { JVCTypes, V4Types } from "../types/index.js";

/**
 * Représente un topic.
 *
 */
export default class Topic {
    private _id: number;
    private _url: string;
    private _api_url: string;

    /**
     * Crée une instance de `Topic`.
     * @param {number} id ID du topic
     */
    constructor(id: number) {
        checkInteger(id);
        this._id = id;
        this._url = `https://${DOMAIN}/forums/42-51-${this._id}-1-0-1-0-${URL_PLACEHOLDER}.htm`;
        this._api_url = `https://${API_DOMAIN}/forums/42-51-${this._id}-1-0-1-0-${URL_PLACEHOLDER}.htm`;
    }

    /**
     * Renvoie l'ID du topic.
     *
     * @readonly
     * @type {number}
     */
    get id(): number {
        return this._id;
    }

    /**
     * Renvoie une URL redirigeant vers le topic.
     *
     * @readonly
     * @type {string}
     */
    get url(): string {
        return this._url;
    }

    /**
     * @hidden
     */
    static _getIdFromUrl(url: string): number {
        return parseInt(url.split('-')[2]);
    }

    /**
     * @hidden
     */
    _rejectIfInexistent(response: Response) {
        if (response.status === HTTP_CODES.NOT_FOUND || response.status === HTTP_CODES.GONE || response.url === FORUMS_PAGE) {
            throw new InexistentContent(`Topic of ID ${this._id} does not exist.`);
        }
    }

    private setUrlPage(page: number, url: string = ""): string {
        const arr = url.length === 0 ? this._url.split("-") : url.split("-");
        arr[3] = page.toString();
        return arr.join("-");
    }

    /**
     * @hidden
     */
    static _getPageFromUrl(url: string): number {
        return parseInt(url.split("-")[3]);
    }

    /**
     * Renvoie une instance de la classe {@link Forum} représentant le forum auquel le topic appartient.
     *
     * @throws {@link errors.InexistentContent | InexistentContent} si le topic n'existe pas
     * @returns  {Promise<Forum>}
     */
    async getForum(): Promise<Forum> {
        const response = await curl(this._api_url);
        this._rejectIfInexistent(response);
        
        return new Forum(Forum._getIdFromURL(response.url));
    }

    /**
     * Renvoie `true` si le topic existe, `false` sinon.
     *
     * @returns  {Promise<boolean>}
     */
    async doesTopicExist(): Promise<boolean> {
        const response = await curl(this._api_url, { allowedStatusErrors: [HTTP_CODES.NOT_FOUND, HTTP_CODES.GONE] });
        
        return response.ok;
    }

    /**
     * Renvoie l'URL exacte du topic.
     *
     * @param {boolean} [api=false] si `true`, renvoie l'URL du topic sur l'API v4. Par défaut `false`.
     * @throws {@link errors.InexistentContent | InexistentContent} si le topic n'existe pas
     * @returns  {Promise<string>}
     */
    async getRealURL(api: boolean = false): Promise<string> {
        const response = await curl(this._api_url);
        this._rejectIfInexistent(response);

        return api ? response.url : response.url.replace(API_DOMAIN, DOMAIN);
    }

    /**
     * Renvoie un objet contenant des informations sur le topic.
     *
     * @throws {@link errors.InexistentContent | InexistentContent} si le topic n'existe pas
     * @returns  {Promise<JVCTypes.Topic.Infos>}
     */
    async getInfos(): Promise<JVCTypes.Topic.Infos> {
        const response = await curl(this._api_url);
        this._rejectIfInexistent(response);

        const $ = load(await response.text());
        const title = $(TOPIC_SELECTORS["title"]).first().text().trim();
        const author = $(TOPIC_SELECTORS["author"]).first().text().trim();
        const publicationDate = convertJVCStringToDate($(TOPIC_SELECTORS["publicationDate"]).first().text().trim())!;
        const forumId = Forum._getIdFromURL(response.url);
        const pageControl = $(TOPIC_SELECTORS["nbPages"]);
        const nbPages = pageControl.length > 0 ? parseInt(pageControl.last().text().trim()) : 1;

        const poll = $(POLL_SELECTORS["bloc"]);
        const pollData: JVCTypes.Topic.Poll = {
            title: "",
            answers: []
        };

        if (poll.length > 0) {
            const pollTitle = poll.find(POLL_SELECTORS["title"]).text().trim().replace("Sondage : ", "");
            const answersEl = poll.find(POLL_SELECTORS["answers"]);
            const pollAnswers = answersEl.get().map((x, i) => {
                const el = $(x);
                const text = el.first().contents().filter((i, x) => {
                    return x.type === 'text';
                }).text().trim();
                const result = parseInt(el.find(POLL_SELECTORS["answersResult"]).text().split(" ")[0].trim());

                return {
                    text,
                    result
                };
            });

            pollData.title = pollTitle;
            pollData.answers = pollAnswers;
        }

        const lastPage = await curl(this.setUrlPage(nbPages, this._api_url));
        const $2 = load(await lastPage.text());
        const lastAnswerDate = convertJVCStringToDate($2(TOPIC_SELECTORS["publicationDate"]).last().text().trim())!;
        
        return {
            id: this.id,
            url: response.url.replace(API_DOMAIN, DOMAIN),
            title,
            author,
            publicationDate,
            lastAnswerDate,
            nbPages,
            forumId,
            ...(poll.length > 0 ? { poll: pollData } : {}),
        }
    }

    /**
     * Renvoie le nombre de connectés au topic.
     *
     * @throws {@link errors.InexistentContent | InexistentContent} si le topic n'existe pas
     * @returns  {Promise<number>}
     */
    async getConnected(): Promise<number> {
        const response = await curl(this._url);
        this._rejectIfInexistent(response);
        const $ = load(await response.text());

        return parseInt($(TOPIC_SELECTORS["connected"]).text().trim().split(" ")[0]);
    }

    private parsePosts($: cheerio.Root, raw: true): JVCTypes.Topic.Post[];
    private parsePosts($: cheerio.Root, raw?: boolean): Post[];
    private parsePosts($: cheerio.Root, raw = false) {
        const posts = $(TOPIC_POST_SELECTORS["class"]);
        const parsedPosts = posts.get().map((x, i): JVCTypes.Topic.Post | Post => {
            const el = $(x);
            const id = parseInt(el.attr("id")!.split("_")[1]);

            if (!raw) {
                return new Post(id) as Post;
            }

            const author = el.find(TOPIC_POST_SELECTORS["author"]).text().trim();
            const date = convertJVCStringToDate(el.find(TOPIC_POST_SELECTORS["date"]).text().trim())!;
            const content = el.find(TOPIC_POST_SELECTORS["content"]).html()!.trim();
            const contentStr = JVCode.htmlToJVCode(content);

            return {
                id,
                author,
                date,
                content: contentStr,
                topicId: this._id
            } as JVCTypes.Topic.Post;
        });

        return parsedPosts as Post[] | JVCTypes.Topic.Post[];
    }

    private readPage(page: number, options: { raw: true }): Promise<JVCTypes.Topic.Post[]>;
    private readPage(page: number, options?: { raw?: boolean }): Promise<Post[]>;
    private async readPage(page: number, { raw = false } = {}): Promise<JVCTypes.Topic.Post[] | Post[]> {
        const url = this.setUrlPage(page, this._api_url);
        const response = await curl(url);

        this._rejectIfInexistent(response);

        if (Topic._getPageFromUrl(response.url) !== page) {
            return [];
        }

        const $ = load(await response.text());
        const parsedPosts = this.parsePosts($, raw);

        return parsedPosts;
    }

    /**
     * @hidden
     */
    read(options: JVCTypes.Request.Options & { page: number, raw: true }): Promise<JVCTypes.Topic.Post[]>;
    /**
     * @hidden
     */
    read(options: JVCTypes.Request.Options & { page: number }): Promise<Post[]>;
    /**
     * @hidden
     */
    read(options: JVCTypes.Request.Options & { raw: true }): AsyncGenerator<JVCTypes.Topic.Post[], void, unknown>;
    /**
     * @hidden
     */
    read(options?: JVCTypes.Request.Options): AsyncGenerator<Post[], void, unknown>;
    /**
     * Renvoie un générateur asynchrone des messages postés sur le topic situés aux pages décrites par le paramètre `paging`.
     *
     * @example
     * ```ts
     * const topic = new Topic(75276105);
     * for await (const page of topic.read()) {
     *      console.log(page);
     * }
     * ```
     * @param {{ paging?: V4Types.Request.Paging, raw?: boolean }} [options]
     * @param {JVCTypes.Request.Paging} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link JVCTypes.Topic.Post}), `false` pour utiliser les classes fournies par la librairie ({@link Post})
     * @throws {@link errors.InexistentContent | InexistentContent} si le topic n'existe pas
     * @returns  {(AsyncGenerator<Post[] | JVCTypes.Topic.Post[], void, unknown>)}
     */
    read(options?: { paging?: V4Types.Request.Paging, raw?: boolean }): AsyncGenerator<Post[] | JVCTypes.Topic.Post[], void, unknown>;
    /**
     * Renvoie les messages postés sur le topic situés à une page particulière.
     *
     * @example
     * ```ts
     * const topic = new Topic(75276105);
     * console.log(await topic.read({ page: 2 }));
     * ```
     * @param {{ page: number, raw?: boolean }} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link JVCTypes.Topic.Post}), `false` pour utiliser les classes fournies par la librairie ({@link Post})
     * @throws {@link errors.InexistentContent | InexistentContent} si le topic n'existe pas
     * @returns  {(Promise<Post[] | JVCTypes.Topic.Post[]>)}
     */
    read(options: { page: number, raw?: boolean }): Promise<Post[] | JVCTypes.Topic.Post[]>;
    read({ raw = false, page, paging = {} }: JVCTypes.Request.Options = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        if (page !== undefined) {
            return this.readPage(page, { raw });
        }

        const { begin = 1, end = null, step = 1 } = paging;
        const self = this;

        return (async function* () {
            let current = begin;
            while (end ? current <= end : true) {
                const posts = await self.readPage(current, { raw });
    
                if (posts.length === 0) {
                    break;
                }
    
                yield posts as Post[] | JVCTypes.Topic.Post[];
                current += step;
            }
        })();
    }

    /**
     * @hidden
     */
    listen(options: { raw: true }): AsyncGenerator<JVCTypes.Topic.Post, void, unknown>;
    /**
     * @hidden
     */
    listen(options?: { raw?: boolean }): AsyncGenerator<Post, void, unknown>;
    /**
     * Renvoie un générateur asynchrone des nouveaux messages détectés.
     *
     * @example
     * ```ts
     * const topic = new Topic(75276105);
     * for await (const page of topic.listen()) {
     *      console.log(page);
     * }
     * ```
     * @param {{ raw?: boolean }} [options]
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link JVCTypes.Topic.Post}), `false` pour utiliser les classes fournies par la librairie ({@link Post})
     * @throws {@link errors.InexistentContent | InexistentContent} si le topic n'existe pas
     * @returns  {(AsyncGenerator<Post | JVCTypes.Topic.Post, void, unknown>)}
     */
    listen(options?: { raw?: boolean }): AsyncGenerator<Post | JVCTypes.Topic.Post, void, unknown>;
    async * listen({ raw = false } = {}) {
        const infos = await this.getInfos();
        let current = infos.nbPages;
        const postsSeen = (await this.readPage(current, { raw: true })).map(topic => topic.id);

        while (true) {
            const url = this.setUrlPage(current, this._api_url);
            const response = await curl(url);
            this._rejectIfInexistent(response);

            const $ = load(await response.text());
            const posts = this.parsePosts($, true);
            current = Topic._getPageFromUrl(response.url); // numéro de page après redirection

            for (const post of posts) {
                if (!postsSeen.includes(post.id)) {
                    yield raw ? post : new Post(post.id);
                    postsSeen.push(post.id);
                }
            }

            const pageControls = $(TOPIC_SELECTORS["nbPages"])
            if (pageControls.length > 2) { // nouvelle page détectée
                current += 1;
            }

            await sleep(SECOND_DELAY);
        }
    }

    /**
     * Renvoie une instance de {@link Post} représentant le message d'origine du topic.
     * 
     * @throws {@link errors.InexistentContent | InexistentContent} si le topic n'existe pas
     * @returns  {Promise<Post>}
     */
    async getFirstPost(): Promise<Post> {
        const response = await curl(this._api_url);
        this._rejectIfInexistent(response);

        const $ = load(await response.text());
        const firstPostId = parseInt($(TOPIC_POST_SELECTORS["class"]).first().attr("id")!.split("_")[1]);

        return new Post(firstPostId);
    }
}