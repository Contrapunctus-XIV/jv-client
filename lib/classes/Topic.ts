/**
 * @module classes
 */

import { NonexistentContent } from "../errors.js";
import { request } from "../requests.js";
import { API_DOMAIN, DOMAIN, FORUMS_PAGE, HTTP_CODES, POLL_SELECTORS, SECOND_DELAY, TOPIC_POST_SELECTORS, TOPIC_SELECTORS, URL_PLACEHOLDER } from "../vars.js";
import Forum from "./Forum.js";
import { load } from "cheerio";
import { checkInteger, convertJVCStringToDate, decodeAllJvCare, sleep } from "../utils.js";
import JVCode from "../scrapers/JVCode.js";
import Post from "./Post.js";
import { JVCTypes, LibTypes } from "../types/index.js";

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
    _rejectIfNonexistent(response: Response) {
        if (response.status === HTTP_CODES.NOT_FOUND || response.status === HTTP_CODES.GONE || response.url === FORUMS_PAGE) {
            throw new NonexistentContent(`Topic of ID ${this._id} does not exist.`);
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
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le topic n'existe pas
     * @returns  {Promise<Forum>}
     */
    async getForum(): Promise<Forum> {
        const response = await request(this._api_url, { curl: true });
        this._rejectIfNonexistent(response);
        
        return new Forum(Forum._getIdFromURL(response.url));
    }

    /**
     * Renvoie `true` si le topic existe, `false` sinon.
     *
     * @returns  {Promise<boolean>}
     */
    async doesTopicExist(): Promise<boolean> {
        const response = await request(this._api_url, { allowedStatusErrors: [HTTP_CODES.NOT_FOUND, HTTP_CODES.GONE], curl: true });
        
        return response.ok && response.url !== FORUMS_PAGE;
    }

    /**
     * Renvoie l'URL exacte du topic.
     *
     * @param {LibTypes.Args.ForumTopic.UseApi} [options]
     * @param {boolean} [options.api] si `true`, renvoie l'URL du topic sur l'API `v4`. Par défaut `false`.
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le topic n'existe pas
     * @returns  {Promise<string>}
     */
    async getStandardURL({ api = false }: LibTypes.Args.ForumTopic.UseApi = {}): Promise<string> {
        const response = await request(this._api_url, { curl: true });
        this._rejectIfNonexistent(response);

        return api ? response.url : response.url.replace(API_DOMAIN, DOMAIN);
    }

    /**
     * Renvoie un objet contenant des informations sur le topic.
     *
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le topic n'existe pas
     * @returns  {Promise<JVCTypes.Topic.Infos>}
     */
    async getInfos(): Promise<JVCTypes.Topic.Infos> {
        const response = await request(this._url, { curl: true });
        this._rejectIfNonexistent(response);

        const $ = load(await response.text());
        decodeAllJvCare($);
        const title = $(TOPIC_SELECTORS["title"]).text().trim();
        const author = $(TOPIC_SELECTORS["author"]).first().text().trim();
        const publicationDate = convertJVCStringToDate($(TOPIC_SELECTORS["publicationDate"]).first().text().trim())!;
        const forumId = Forum._getIdFromURL(response.url);
        const pageControl = $(TOPIC_SELECTORS["nbPages"]);
        const nbPages = pageControl.length > 0 ? Topic._getPageFromUrl(pageControl.attr("href")!) : 1;
        const lockEl = $(TOPIC_SELECTORS["lockReason"]);
        const resolved = $(TOPIC_SELECTORS["resolved"]).first().text().includes("résolu");

        const lastPage = await request(this.setUrlPage(nbPages, this._api_url), { curl: true });
        const $2 = load(await lastPage.text());
        const lastAnswerDate = convertJVCStringToDate($2(TOPIC_SELECTORS["publicationDateApi"]).last().text().trim())!;
        
        const poll = $2(POLL_SELECTORS["bloc"]);
        const pollData: JVCTypes.Topic.Poll = {
            title: "",
            answers: []
        };

        if (poll.length > 0) {
            const pollTitle = poll.find(POLL_SELECTORS["title"]).text().replace("Sondage : ", "").trim();
            const answersEl = poll.find(POLL_SELECTORS["answers"]);
            const pollAnswers = answersEl.get().map((x, i) => {
                const el = $2(x);
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

        return {
            id: this.id,
            url: response.url.replace(API_DOMAIN, DOMAIN),
            title,
            author,
            publicationDate,
            lastAnswerDate,
            nbPages,
            forumId,
            resolved,
            ...(poll.length > 0 ? { poll: pollData } : {}),
            ...(lockEl.length > 0 ? { lockReason: lockEl.text().trim() } : {})
        }
    }

    /**
     * Renvoie le nombre de connectés au topic.
     *
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le topic n'existe pas
     * @returns  {Promise<number>}
     */
    async getConnected(): Promise<number> {
        const response = await request(this._url, { curl: true });
        this._rejectIfNonexistent(response);
        const $ = load(await response.text());

        return parseInt($(TOPIC_SELECTORS["connected"]).text().trim().split(" ")[0]);
    }

    private parsePosts($: cheerio.Root, options: LibTypes.Args.Raw): JVCTypes.Topic.Post[];
    private parsePosts($: cheerio.Root, options?: LibTypes.Args.NotRaw): Post[];
    private parsePosts($: cheerio.Root, { raw = false }: LibTypes.Args.NotRaw = {}) {
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

    private readPage(page: number, options: LibTypes.Args.Raw): Promise<JVCTypes.Topic.Post[]>;
    private readPage(page: number, options?: LibTypes.Args.NotRaw): Promise<Post[]>;
    private async readPage(page: number, { raw = false }: LibTypes.Args.NotRaw = {}): Promise<JVCTypes.Topic.Post[] | Post[]> {
        const url = this.setUrlPage(page, this._api_url);
        const response = await request(url, { curl: true });

        this._rejectIfNonexistent(response);

        if (Topic._getPageFromUrl(response.url) !== page) {
            return [];
        }

        const $ = load(await response.text());
        const parsedPosts = this.parsePosts($, { raw });

        return parsedPosts;
    }

    /**
     * @hidden
     */
    read(options: LibTypes.Args.RawAndPage): Promise<JVCTypes.Topic.Post[]>;
    /**
     * @hidden
     */
    read(options: LibTypes.Args.Page): Promise<Post[]>;
    /**
     * @hidden
     */
    read(options: LibTypes.Args.RawAndPaging): AsyncGenerator<JVCTypes.Topic.Post[], void, unknown>;
    /**
     * @hidden
     */
    read(options?: LibTypes.Args.Paging): AsyncGenerator<Post[], void, unknown>;
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
     * @param {LibTypes.Args.Paging} [options]
     * @param {JVCTypes.Request.Paging} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link JVCTypes.Topic.Post | `JVCTypes.Topic.Post`}), `false` pour utiliser les classes fournies par la librairie ({@link Post | `Post`})
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le topic n'existe pas
     * @returns  {(AsyncGenerator<Post[] | JVCTypes.Topic.Post[], void, unknown>)}
     */
    read(options?: LibTypes.Args.Paging): AsyncGenerator<Post[] | JVCTypes.Topic.Post[], void, unknown>;
    /**
     * Renvoie les messages postés sur le topic situés à une page particulière.
     *
     * @example
     * ```ts
     * const topic = new Topic(75276105);
     * console.log(await topic.read({ page: 2 }));
     * ```
     * @param {LibTypes.Args.Page} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link JVCTypes.Topic.Post | `JVCTypes.Topic.Post`}), `false` pour utiliser les classes fournies par la librairie ({@link Post | `Post`})
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le topic n'existe pas
     * @returns  {(Promise<Post[] | JVCTypes.Topic.Post[]>)}
     */
    read(options: LibTypes.Args.Page): Promise<Post[] | JVCTypes.Topic.Post[]>;
    read({ raw = false, page, paging = {} }: LibTypes.Args.PageOrPaging = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
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
    listen(options: LibTypes.Args.Raw): AsyncGenerator<JVCTypes.Topic.Post, void, unknown>;
    /**
     * @hidden
     */
    listen(options?: LibTypes.Args.NotRaw): AsyncGenerator<Post, void, unknown>;
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
     * @param {LibTypes.Args.NotRaw} [options]
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link JVCTypes.Topic.Post | `JVCTypes.Topic.Post`}), `false` pour utiliser les classes fournies par la librairie ({@link Post | `Post`})
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le topic n'existe pas
     * @returns  {(AsyncGenerator<Post | JVCTypes.Topic.Post, void, unknown>)}
     */
    listen(options?: LibTypes.Args.NotRaw): AsyncGenerator<Post | JVCTypes.Topic.Post, void, unknown>;
    async * listen({ raw = false } = {}) {
        const infos = await this.getInfos();
        let current = infos.nbPages;
        const postsSeen = (await this.readPage(current, { raw: true })).map(topic => topic.id);

        while (true) {
            const url = this.setUrlPage(current, this._api_url);
            const response = await request(url, { curl: true });
            this._rejectIfNonexistent(response);

            const $ = load(await response.text());
            const posts = this.parsePosts($, { raw: true });
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
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le topic n'existe pas
     * @returns  {Promise<Post>}
     */
    async getFirstPost(): Promise<Post> {
        const response = await request(this._api_url, { curl: true });
        this._rejectIfNonexistent(response);

        const $ = load(await response.text());
        const firstPostId = parseInt($(TOPIC_POST_SELECTORS["class"]).first().attr("id")!.split("_")[1]);

        return new Post(firstPostId);
    }
}