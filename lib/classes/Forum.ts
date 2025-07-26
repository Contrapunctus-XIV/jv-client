/**
 * @module classes
 */

import { API_DOMAIN, SELECTORS, TOPIC_FEED_SELECTORS, TOPIC_ICONS, TOPICS_PER_PAGE, DOMAIN, SECOND_DELAY, URL_PLACEHOLDER, FORUMS_PAGE, HTTP_CODES } from "../vars.js";
import { request } from "../requests.js";
import { load } from "cheerio";
import { checkInteger, convertJVCStringToDate, sleep } from "../utils.js";
import Topic from "./Topic.js";
import { NonexistentContent } from "../errors.js";
import { JVCTypes, LibTypes } from "../types/index.js";

/**
 * Classe représentant un forum. Utilise le site JVC.
 * 
 */
export default class Forum {
    private _id: number;
    private _url: string;
    private _api_url: string;

    /**
     * Crée une instance de la classe `Forum`.
     * @param {number} id ID du forum
     */
    constructor(id: number) {
        checkInteger(id);
        this._id = id;
        this._url = `https://${DOMAIN}/forums/0-${this._id}-0-1-0-1-0-${URL_PLACEHOLDER}.htm`
        this._api_url = `https://${API_DOMAIN}/forums/0-${this._id}-0-1-0-1-0-${URL_PLACEHOLDER}.htm`;
    }

    /**
     * 
     * @private
     * @hidden
     */
    private generator(url: string, paging: LibTypes.Args.Pagination, options: LibTypes.Args.Raw<LibTypes.Args.Query>): AsyncGenerator<JVCTypes.Forum.Topic[], void, unknown>;
    private generator(url: string, paging: LibTypes.Args.Pagination, options?: LibTypes.Args.NotRaw<LibTypes.Args.Query>): AsyncGenerator<Topic[], void, unknown>;
    private generator(url: string, paging: LibTypes.Args.Pagination, { raw = false, query = {} }: LibTypes.Args.NotRaw<LibTypes.Args.Query> = {}) {
        const self = this;
        const { begin = 1, end = null, step = 1 } = paging;
        
        return (async function* () {
            let currentPage = begin;

            while (end ? currentPage <= end : true) {
                const forumUrl = self.setUrlPage(currentPage, url);
                const response = await request(forumUrl, { query, allowedStatusErrors: [HTTP_CODES.NOT_FOUND], curl: true });
                
                self._rejectIfNonexistent(response);

                const $ = load(await response.text());
                const parsedTopics = Forum.parseTopics($, { raw });
                yield parsedTopics as JVCTypes.Forum.Topic[] | Topic[];

                if ($(TOPIC_FEED_SELECTORS["nav"]).attr("href") === "") { // si plus de topics après cette page
                    break;
                }
                currentPage += step;
                //await sleep(DELAY);
            }
        })();
    }

    /**
     * @private
     * @hidden
     */
    private requestForum(url: string, options: LibTypes.Args.Raw<LibTypes.Args.Query>): Promise<JVCTypes.Forum.Topic[]>;
    private requestForum(url: string, options?: LibTypes.Args.NotRaw<LibTypes.Args.Query>): Promise<Topic[]>;
    private async requestForum(url: string, { raw = false, query = {} }: LibTypes.Args.NotRaw<LibTypes.Args.Query>) {
        const response = await request(url, { query, curl: true });
        // JVC renvoie une erreur 404 si la page n'existe pas, mais redirection si le forum n'existe pas
        // on renvoie un tableau vide dans le premier cas, mais erreur dans le second
        // d'où l'appel à _rejectIfNonexistent que s'il y a redirection
        if (response.url === FORUMS_PAGE) {
            this._rejectIfNonexistent(response);
        }
        const data = await response.text();
        const $ = load(data);
        const parsedTopics = Forum.parseTopics($, { raw });
        return parsedTopics as JVCTypes.Forum.Topic[] | Topic[];
    }

    /**
     * 
     * @param {Response} response
     * @returns {void}
     * @hidden
     */
    _rejectIfNonexistent(response: Response) {
        if (response.status === HTTP_CODES.NOT_FOUND || response.url === FORUMS_PAGE) {
            throw new NonexistentContent(`Forum of ID ${this._id} does not exist.`);
        }
    }

    /**
     * @private
     * @param {number} page
     * @param {string} url?
     * @returns {string}
     * @hidden
     */
    private setUrlPage(page: number, url: string = ""): string {
        const arr = url.length === 0 ? this._url.split("-") : url.split("-");
        arr[5] = ((page-1) * TOPICS_PER_PAGE + 1).toString();
        return arr.join("-");
    }

    /**
     * @public
     * @param {string} url
     * @returns {number}
     * @hidden
     */
    public static _getIdFromURL(url: string): number {
        return parseInt(url.split('-')[1]);
    }

    /**
     * Renvoie le titre du forum sous forme de chaîne de caractères.
     * 
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le forum n'existe pas
     * @returns {Promise<string>}
     */
    async getForumTitle(): Promise<string> {
        const response = await request(this._api_url, { allowedStatusErrors: [HTTP_CODES.NOT_FOUND], curl: true });
        this._rejectIfNonexistent(response);

        const $ = load(await response.text());
        return $(TOPIC_FEED_SELECTORS["forumTitle"]).text().trim();
    }

    /**
     * Renvoie un booléen à `true` si le forum existe, `false` sinon.
     * 
     * @returns {Promise<boolean>}
     */
    async doesForumExist(): Promise<boolean> {
        const response = await request(this._api_url, { allowedStatusErrors: [HTTP_CODES.NOT_FOUND], curl: true });
        return response.ok && response.url !== FORUMS_PAGE;
    }

    /**
     * Renvoie l'ID du forum.
     * 
     * @returns {number}
     */
    get id(): number {
        return this._id;
    }

    /**
     * Renvoie une URL redirigeant vers le forum.
     * 
     * @returns {string}
     */
    get url(): string {
        return this._url;
    }

    /**
     * Renvoie l'URL exacte du forum, obtenue après une requête à JVC.
     * 
     * @param {LibTypes.Args.ForumTopic.UseApi} [options]
     * @param {boolean} [options.api] `true` pour renvoyer l'URL de l'API `v4`, `false` pour celle du site JVC (par défaut)
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le forum n'existe pas
     * @returns {Promise<string>}
     */
    async getStandardURL({ api = false }: LibTypes.Args.ForumTopic.UseApi = {}): Promise<string> {
        const response = await request(this._api_url, { allowedStatusErrors: [HTTP_CODES.NOT_FOUND], curl: true });
        this._rejectIfNonexistent(response);
        return api ? response.url : response.url.replace(API_DOMAIN, DOMAIN);
    }

    /**
     * 
     * @private
     * @hidden
     */
    private static parseTopics($: cheerio.Root, options: LibTypes.Args.Raw): JVCTypes.Forum.Topic[];
    private static parseTopics($: cheerio.Root, options?: LibTypes.Args.NotRaw): Topic[];
    private static parseTopics($: cheerio.Root, { raw = false }: LibTypes.Args.NotRaw = {}): Topic[] | JVCTypes.Forum.Topic[] {
        const topics = $(SELECTORS["topicItem"]);
        
        const parsedTopics = topics.get().map((x, i): Topic | JVCTypes.Forum.Topic => {
            const el = $(x);
            const url = `https://${DOMAIN}${el.attr("href")!}`;
            const id = Topic._getIdFromUrl(url);

            if (!raw) {
                return new Topic(id);
            }

            const title = el.find(TOPIC_FEED_SELECTORS["title"]).text().trim().split("\n")[0];
            const nbAnswers = parseInt(el.find(TOPIC_FEED_SELECTORS["nbAnswers"]).text().slice(1, -1));
            const author = el.find(TOPIC_FEED_SELECTORS["author"]).text().trim();
            const lastAnswerDate = convertJVCStringToDate(el.find(TOPIC_FEED_SELECTORS["lastAnswerDate"]).text().trim())!;
            const icon = TOPIC_ICONS[el.find(TOPIC_FEED_SELECTORS["icon"]).attr("class")!.split(" ")[1] as string];

            return {
                id,
                url,
                title,
                nbAnswers,
                author,
                lastAnswerDate,
                icon
            };
        });
        
        return parsedTopics as Topic[] | JVCTypes.Forum.Topic[];
    }

    /**
     * @hidden
     */
    readTopics(options: LibTypes.Args.RawAndPage): Promise<JVCTypes.Forum.Topic[]>;
    /**
     * @hidden
     */
    readTopics(options: LibTypes.Args.Page): Promise<Topic[]>;
    /**
     * @hidden
     */
    readTopics(options: LibTypes.Args.RawAndPaging): AsyncGenerator<JVCTypes.Forum.Topic[], void, unknown>;
    /**
     * @hidden
     */
    readTopics(options?: LibTypes.Args.Paging): AsyncGenerator<Topic[], void, unknown>;
    /**
     * Renvoie un générateur asynchrone des topics postés sur le forum situés aux pages décrites par le paramètre `paging`.
     * 
     * @example
     * ```ts
     * const forum = new Forum(51);
     * for await (const page of forum.readTopics()) {
     *      console.log(page);
     * }
     * ```
     *
     * @param {LibTypes.Args.Paging} [options]
     * @param {JVCTypes.Request.Paging} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link JVCTypes.Forum.Topic | `JVCTypes.Forum.Topic`}), `false` pour utiliser les classes fournies par la librairie ({@link Topic | `Topic`})
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le forum n'existe pas
     * @returns  {(AsyncGenerator<Topic[] |  JVCTypes.Forum.Topic[], void, unknown>)}
     */
    readTopics(options?: LibTypes.Args.Paging): AsyncGenerator<Topic[] | JVCTypes.Forum.Topic[], void, unknown>;
    /**
     * Renvoie les topics postés sur le forum situés à une page particulière.
     *
     * @example
     * ```ts
     * const forum = new Forum(51);
     * console.log(await forum.readTopics({ page: 2 }));
     * ```
     * @param {LibTypes.Args.Page} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link JVCTypes.Forum.Topic | `JVCTypes.Forum.Topic`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Topic | `Topic`})
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le forum n'existe pas
     * @returns  {(AsyncGenerator<Topic[] |  JVCTypes.Forum.Topic[], void, unknown>)}
     */
    readTopics(options: LibTypes.Args.Page): Promise<Topic[] |  JVCTypes.Forum.Topic[]>;
    readTopics({ paging = {}, page, raw = false }: LibTypes.Args.PageOrPaging = {}): AsyncGenerator<any, void, unknown> | Promise<any> {
        if (page !== undefined) {
            const url = this.setUrlPage(page, this._api_url);
            return this.requestForum(url, { raw });
        }

        return this.generator(this._api_url, paging, { raw });
    }

    /**
     * @hidden
     */
    searchTopics(q: string, options: LibTypes.Args.RawAndPage<LibTypes.Args.ForumTopic.SearchTopic>): Promise<JVCTypes.Forum.Topic[]>;
    /**
     * @hidden
     */
    searchTopics(q: string, options: LibTypes.Args.Page<LibTypes.Args.ForumTopic.SearchTopic>): Promise<Topic[]>;
    /**
     * @hidden
     */
    searchTopics(q: string, options: LibTypes.Args.RawAndPaging<LibTypes.Args.ForumTopic.SearchTopic>): AsyncGenerator<JVCTypes.Forum.Topic[], void, unknown>;
    /**
     * @hidden
     */
    searchTopics(q: string, options?: LibTypes.Args.Paging<LibTypes.Args.ForumTopic.SearchTopic>): AsyncGenerator<Topic[], void, unknown>;
    /**
     * Renvoie un générateur asynchrone des résultats de la recherche de topics postés sur le forum situés aux pages décrites par le paramètre `paging`.
     *
     * @param {string} q termes de recherche
     * @param {LibTypes.Args.Paging<LibTypes.Args.ForumTopic.SearchTopic>} [options]
     * @param {JVCTypes.Request.Paging} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link JVCTypes.Forum.Topic | `JVCTypes.Forum.Topic`}), `false` pour utiliser les classes fournies par la librairie ({@link Topic | `Topic`})
     * @param {"title" | "author"} [options.searchMode] type de recherche, par titre (défaut) ou par auteur
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le forum n'existe pas
     * @returns  {(AsyncGenerator<Topic[] | JVCTypes.Forum.Topic[], void, unknown>)}
     */
    searchTopics(q: string, options?: LibTypes.Args.Paging<LibTypes.Args.ForumTopic.SearchTopic>): AsyncGenerator<Topic[] | JVCTypes.Forum.Topic[], void, unknown>;
    /**
     * Renvoie les résultats de la recherche de topics postés sur le forum situés à une page particulière.
     *
     * @param {string} q termes de recherche
     * @param {LibTypes.Args.Page<LibTypes.Args.ForumTopic.SearchTopic>} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link JVCTypes.Forum.Topic | `JVCTypes.Forum.Topic`}), `false` pour utiliser les classes fournies par la librairie ({@link Topic | `Topic`})
     * @param {"title" | "author"} [options.searchMode] type de recherche, par titre (défaut) ou par auteur
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le forum n'existe pas
     * @returns  {(Promise<Topic[] | JVCTypes.Forum.Topic[]>)}
     */
    searchTopics(q: string, options: LibTypes.Args.Page<LibTypes.Args.ForumTopic.SearchTopic>): Promise<Topic[] | JVCTypes.Forum.Topic[]>;
    searchTopics(q: string, { paging = {}, page, raw = false, searchMode = "title" }: LibTypes.Args.PageOrPaging<LibTypes.Args.ForumTopic.SearchTopic> = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const mode = searchMode === "title" ? "titre_topic" : "auteur_topic";
        const query = { "search_in_forum": q, "type_search_in_forum": mode };
        const urlPromise = this.getStandardURL({ api: true }).then(url => url.replace("/forums", "/recherche/forums"));
    
        if (page !== undefined) {
            return urlPromise.then(url => {
                return this.requestForum(url, { raw, query });
            });
        }
    
        const self = this;

        return (async function* () {
            const url = await urlPromise;
            yield* self.generator(url, paging, { raw, query });
        })();
    }

    /**
     * Renvoie le nombre de connectés au forum.
     *
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le forum n'existe pas
     * @returns {Promise<number>}
     */
    async getConnected(): Promise<number> {
        const response = await request(this._url, { allowedStatusErrors: [HTTP_CODES.NOT_FOUND], curl: true });

        this._rejectIfNonexistent(response);

        const $ = load(await response.text());
        const connected = parseInt($(TOPIC_FEED_SELECTORS["connected"]).text().trim().split(" ")[0]);

        return connected;
    }

    /**
     * @hidden
     */
    listen(options: LibTypes.Args.Raw): AsyncGenerator<JVCTypes.Forum.Topic, void, unknown>;
    /**
     * @hidden
     */
    listen(options?: LibTypes.Args.NotRaw): AsyncGenerator<Topic, void, unknown>;
    /**
     * Renvoie un générateur asynchrone des nouveaux topics détectés.
     *
     * @example
     * ```ts
     * const forum = new Forum(51);
     * for await (const newTopic of forum.listen()) {
     *      console.log(newTopic);
     * }
     * ```
     * @param {LibTypes.Args.NotRaw} [options]
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link JVCTypes.Forum.Topic | `JVCTypes.Forum.Topic`}), `false` pour utiliser les classes fournies par la librairie ({@link Topic | `Topic`})
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le forum n'existe pas
     * @returns  {(AsyncGenerator<Topic | JVCTypes.Forum.Topic, void, unknown>)}
     */
    listen(options?: LibTypes.Args.NotRaw): AsyncGenerator<Topic | JVCTypes.Forum.Topic, void, unknown>;
    async * listen({ raw = false }: LibTypes.Args.NotRaw = {}) {
        const topicsSeen: number[] = [];

        while (true) {
            const response = await request(this._api_url, { allowedStatusErrors: [HTTP_CODES.NOT_FOUND], curl: true });

            this._rejectIfNonexistent(response);

            const $ = load(await response.text());
            const topics = Forum.parseTopics($, { raw: true });
            for (const topic of topics) {
                if (topic.nbAnswers === 0 && topic.icon !== "pinned" && !topicsSeen.includes(topic.id)) {
                    yield raw ? topic : new Topic(topic.id);
                    topicsSeen.push(topic.id);
                }
            }

            await sleep(SECOND_DELAY);
        }
    }

}