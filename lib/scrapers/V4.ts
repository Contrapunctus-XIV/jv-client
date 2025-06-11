/**
 * @module scrapers
 */

import { callApi } from "../requests.js";
import Content, { Video } from "../classes/Content.js";
import Game from "../classes/Game.js";
import { DEFAULT_PER_PAGE } from "../vars.js";
import { V4Types } from "../types/index.js";

function generator(route: string, paging: V4Types.Request.Paging, options: V4Types.Request.RequestOptions & { raw: true, type: "video" }): AsyncGenerator<V4Types.Videos.Raw, void, unknown>;
function generator(route: string, paging: V4Types.Request.Paging, options: V4Types.Request.RequestOptions & { raw: true, type: "game" }): AsyncGenerator<V4Types.Games.Raw, void, unknown>;
function generator(route: string, paging: V4Types.Request.Paging, options: V4Types.Request.RequestOptions & { raw: true, type: "hightech" }): AsyncGenerator<V4Types.Contents.RawHighTech, void, unknown>;
function generator(route: string, paging: V4Types.Request.Paging, options: V4Types.Request.RequestOptions & { raw: true }): AsyncGenerator<V4Types.Contents.Raw, void, unknown>;
function generator(route: string, paging: V4Types.Request.Paging, options: V4Types.Request.RequestOptions & { type: "video" }): AsyncGenerator<Video[], void, unknown>;
function generator(route: string, paging: V4Types.Request.Paging, options: V4Types.Request.RequestOptions & { type: "game" }): AsyncGenerator<Game[], void, unknown>;
function generator(route: string, paging: V4Types.Request.Paging, options: V4Types.Request.RequestOptions & { type: "hightech" }): AsyncGenerator<V4Types.Contents.HighTech, void, unknown>;
function generator(route: string, paging: V4Types.Request.Paging, options?: V4Types.Request.RequestOptions): AsyncGenerator<Content[], void, unknown>;
function generator(route: string, paging: V4Types.Request.Paging, { query = {}, raw = false, type = "content" }: V4Types.Request.RequestOptions = {}) {
    return (async function* () {
        const { begin = 1, end = null, step = 1 } = paging;
        let current = begin;

        while (end ? current <= end : true) {
            try {
                const data = await request(route, { query: { ...query, page: current }, raw, type }) as any;
                if (raw && (!data || !data.items || data.items.length === 0)) break;
                else if (data.length === 0) break;
                
                yield data;
            } catch (e: any) {
                break;
            }

            current += step;
        }
    })();
}

function request(route: string, options: V4Types.Request.RequestOptions & { raw: true, type: "video" }): Promise<V4Types.Videos.Raw>;
function request(route: string, options: V4Types.Request.RequestOptions & { raw: true, type: "game" }): Promise<V4Types.Games.Raw>;
function request(route: string, options: V4Types.Request.RequestOptions & { raw: true, type: "hightech" }): Promise<V4Types.Contents.RawHighTech>;
function request(route: string, options: V4Types.Request.RequestOptions & { raw: true }): Promise<V4Types.Contents.Raw>;
function request(route: string, options: V4Types.Request.RequestOptions & { type: "video" }): Promise<Video[]>;
function request(route: string, options: V4Types.Request.RequestOptions & { type: "game" }): Promise<Game[]>;
function request(route: string, options: V4Types.Request.RequestOptions & { type: "hightech" }): Promise<V4Types.Contents.HighTech>;
function request(route: string, options?: V4Types.Request.RequestOptions): Promise<Content[]>;
function request(route: string, { query = {}, raw = false, type = "content" }: V4Types.Request.RequestOptions = {}) {
    return callApi(route, { query })
        .then(response => response.json())
        .then(data => {
            switch (type) {
                case "content":
                    return raw ? data as V4Types.Contents.Raw : data.items.map((c: V4Types.Content.Generic) => new Content(c.id));
                case "video":
                    return raw ? data as V4Types.Videos.Raw : data.items.map((v: V4Types.Video.Infos) => new Video(v.id));
                case "game":
                    return raw ? data as V4Types.Games.Raw : data.items.map((g: V4Types.Game.Generic) => new Game(g.id));
                case "hightech":
                    return Object.fromEntries(Object.entries(data as V4Types.Contents.RawHighTech).map(([k, v]) =>
                        [k, v.items.map((item: any) => new Content(item.id))]
                    )) as V4Types.Contents.HighTech;
            }
        });
}

/**
 * Classe contenant des méthodes statiques permettant de récupérer des jeux vidéo et des contenus selon des critères précis grâce à l'API v4.
 * @abstract
 * @hideconstructor
 */
export default abstract class V4 {
    /**
     * @hidden
     */
    static getContents(options: V4Types.Request.ContentsOptions & { page: number, raw: true }): Promise<V4Types.Contents.Raw>;
    /**
     * @hidden
     */
    static getContents(options: V4Types.Request.ContentsOptions & { page: number }): Promise<Content[]>;
    /**
     * @hidden
     */
    static getContents(options: V4Types.Request.ContentsOptions & { raw: true }): AsyncGenerator<V4Types.Contents.Raw, void, unknown>;
    /**
     * @hidden
     */
    static getContents(options?: V4Types.Request.ContentsOptions): AsyncGenerator<Content[], void, unknown>;
    /**
     * Renvoie un générateur asynchrone des contenus (actualités, articles, wikis...) situés aux pages décrites par le paramètre `paging` et satisfaisant au `query` donné.
     * 
     * @example
     * ```ts
     * for await (const page of V4.getContents()) {
     *      console.log(page);
     * }
     * ```
     * @param {{ paging?: V4Types.Request.Paging, raw?: boolean, query?: V4Types.Request.ContentsQuery, perPage?: number }} [options]
     * @param {V4Types.Request.Paging} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Contents.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content})
     * @param {V4Types.Request.ContentsQuery} [options.query] à renseigner pour affiner la recherche
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 20
     * @returns {(AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>)}
     */
    static getContents(options?: { paging?: V4Types.Request.Paging, raw?: boolean, query?: V4Types.Request.ContentsQuery, perPage?: number }): AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>;
    /**
     * Renvoie les contenus (actualités, articles, wikis...) situés à une page particulière et satisfaisant au `query` donné.
     *
     * @example
     * ```ts
     * console.log(await V4.getContents({ page: 2 }));
     * ```
     * @param {{ page: number, raw?: boolean, query?: V4Types.Request.ContentsQuery, perPage?: number }} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Contents.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content})
     * @param {V4Types.Request.ContentsQuery} [options.query] à renseigner pour affiner la recherche
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 20
     * @returns {(Promise<Content[] | V4Types.Contents.Raw>)}
     */
    static getContents(options: { page: number, raw?: boolean, query?: V4Types.Request.ContentsQuery, perPage?: number }): Promise<Content[] | V4Types.Contents.Raw>;
    static getContents({ raw = false, page, paging = {}, perPage = DEFAULT_PER_PAGE, query = {} }: V4Types.Request.ContentsOptions = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = 'contents';
    
        if (page !== undefined) {
            return request(route, { raw, query: { ...query, page, perPage } });
        }
            
        return generator(route, paging, { raw, query: { ...query, page, perPage } });
    }
    
    /**
     * @hidden
     */
    static getHighTechContents(options: V4Types.Request.Options & { page: number, raw: true }): Promise<V4Types.Contents.RawHighTech>;
    /**
     * @hidden
     */
    static getHighTechContents(options: V4Types.Request.Options & { page: number }): Promise<V4Types.Contents.HighTech>;
    /**
     * @hidden
     */
    static getHighTechContents(options: V4Types.Request.Options & { raw: true }): AsyncGenerator<V4Types.Contents.RawHighTech, void, unknown>;
    /**
     * @hidden
     */
    static getHighTechContents(options?: V4Types.Request.Options): AsyncGenerator<V4Types.Contents.HighTech, void, unknown>;
    /**
     * Renvoie un générateur asynchrone des contenus high-tech situés aux pages décrites par le paramètre `paging`.
     * 
     * @example
     * ```ts
     * for await (const page of V4.getHighTechContents()) {
     *      console.log(page);
     * }
     * ```
     * 
     * @param  {{ paging?: V4Types.Request.Paging, raw?: boolean, perPage?: number }} [options]
     * @param {V4Types.Request.Paging} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Contents.RawHighTech}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link V4Types.Contents.HighTech})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 20
     * @returns {(AsyncGenerator<V4Types.Contents.HighTech | V4Types.Contents.RawHighTech, void, unknown>)}
     */
    static getHighTechContents(options?: { paging?: V4Types.Request.Paging, raw?: boolean, perPage?: number }): AsyncGenerator<V4Types.Contents.HighTech | V4Types.Contents.RawHighTech, void, unknown>;
    /**
     * Renvoie les contenus high-tech situés à une page particulière.
     * 
     * @example
     * ```ts
     * console.log(await V4.getHighTechContents({ page: 2 }));
     * ```
     * 
     * @param  {{ page: number, raw?: boolean, perPage?: number }} options 
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Contents.RawHighTech}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link V4Types.Contents.HighTech})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 20
     * @returns {(Promise<V4Types.Contents.HighTech | V4Types.Contents.RawHighTech>)} 
     */
    static getHighTechContents(options: { page: number, raw?: boolean, perPage?: number }): Promise<V4Types.Contents.HighTech | V4Types.Contents.RawHighTech>;
    static getHighTechContents({ raw = false, page, paging = {}, perPage = DEFAULT_PER_PAGE }: V4Types.Request.Options = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = 'contents/hightech';
    
        if (page !== undefined) {
            return request(route, { raw, query: { page, perPage }, type: "hightech" });
        }
    
        return generator(route, paging, { raw, query: { page, perPage }, type: "hightech" });
    }
    
    /**
     * @hidden
     */
    static getTrendingContents(options: V4Types.Request.Options & { page: number, raw: true }): Promise<V4Types.Contents.Raw>;
    /**
     * @hidden
     */
    static getTrendingContents(options: V4Types.Request.Options & { page: number }): Promise<Content[]>;
    /**
     * @hidden
     */
    static getTrendingContents(options: V4Types.Request.Options & { raw: true }): AsyncGenerator<V4Types.Contents.Raw, void, unknown>;
    /**
     * @hidden
     */
    static getTrendingContents(options?: V4Types.Request.Options): AsyncGenerator<Content[], void, unknown>;
    /**
     * Renvoie un générateur asynchrone des contenus tendance situés aux pages décrites par le paramètre `paging`.
     * 
     * @example
     * ```ts
     * for await (const page of V4.getTrendingContents()) {
     *      console.log(page);
     * }
     * ```
     * 
     * @param  {{ paging?: V4Types.Request.Paging, raw?: boolean, perPage?: number }} [options]
     * @param {V4Types.Request.Paging} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Contents.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content})
     * @param {boolean} [options.perPage] nombre d'entités par page, par défaut 20
     * @returns {(AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>)}
     */
    static getTrendingContents(options?: { paging?: V4Types.Request.Paging, raw?: boolean, perPage?: number }): AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>;
    /**
     * Renvoie les contenus tendance situés à une page particulière.
     * 
     * @example
     * ```ts
     * console.log(await V4.getTrendingContents({ page: 2 }));
     * ```
     * 
     * @param  {{ page: number, raw?: boolean, perPage?: number }} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Contents.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content})
     * @param {boolean} [options.perPage] nombre d'entités par page, par défaut 20
     * @returns {(Promise<Content[] | V4Types.Contents.Raw>)} 
     */
    static getTrendingContents(options: { page: number, raw?: boolean, perPage?: number }): Promise<Content[] | V4Types.Contents.Raw>;
    static getTrendingContents({ raw = false, page, paging = {}, perPage = DEFAULT_PER_PAGE }: V4Types.Request.Options = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = 'contents/trending';
    
        if (page !== undefined) {
            return request(route, { raw, query: { page, perPage } });
        }
            
        return generator(route, paging, { raw, query: { page, perPage } });
    }
    
    /**
     * @hidden
     */
    static getGamesSummary(options: { raw?: true }): Promise<V4Types.Games.RawSummary>;
    /**
     * @hidden
     */
    static getGamesSummary(options?: { raw?: boolean }): Promise<V4Types.Games.Summary>;
    /**
     * Renvoie un sommaire contenant les contenus du moment portant sur des jeux vidéo.
     * 
     * @param  {{ raw?: boolean }} [options]
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Games.RawSummary}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link V4Types.Games.Summary})
     * @returns {(Promise<V4Types.Games.Summary | V4Types.Games.RawSummary>)}
     */
    static getGamesSummary(options?: { raw?: boolean }): Promise<V4Types.Games.Summary | V4Types.Games.RawSummary>;
    static async getGamesSummary({ raw = false }: { raw?: boolean } = {}) {
        const route = 'contents/games';
    
        const response = await callApi(route);
        const data = await response.json() as V4Types.Games.RawSummary;
    
        if (raw) {
            return data;
        }
    
        return Object.fromEntries(Object.entries(data).map(([k, v]) => {
            switch (k) {
                case 'reviews':
                case 'previews':
                case 'tipsnews':
                    return [k, v.items.map((item: any) => new Content(item.id))];
                case 'releases':
                case 'trending':
                case 'awaited':
                    return [k, v.items.map((item: any) => new Game(item.id))];
                default:
                    return [k, v.items.map((item: any) => new Content(item.id))];
            }
        })) as V4Types.Games.Summary;
    }
    
    /**
     * @hidden
     */
    static getGames(options: V4Types.Request.GamesOptions & { page: number, raw: true }): Promise<V4Types.Games.Raw>;
    /**
     * @hidden
     */
    static getGames(options: V4Types.Request.GamesOptions & { page: number }): Promise<Game[]>;
    /**
     * @hidden
     */
    static getGames(options: V4Types.Request.GamesOptions & { raw: true }): AsyncGenerator<V4Types.Games.Raw, void, unknown>;
    /**
     * @hidden
     */
    static getGames(options?: V4Types.Request.GamesOptions): AsyncGenerator<Game[], void, unknown>;
    /**
     * Renvoie un générateur asynchrone des jeux vidéo situés aux pages décrites par le paramètre `paging` et satisfaisant au `query` donné.
     * 
     * @example
     * ```ts
     * for await (const page of V4.getGames()) {
     *      console.log(page);
     * }
     * ```
     * 
     * @param  {{ paging?: V4Types.Request.Paging, raw?: boolean, query?: V4Types.Request.GamesQuery, perPage?: number }} [options]
     * @param {V4Types.Request.Paging} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Games.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Game})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 20
     * @param {V4Types.Request.ContentsQuery} [options.query] à renseigner pour affiner la recherche
     * @returns {(AsyncGenerator<Game[] | V4Types.Games.Raw, void, unknown>)} 
     */
    static getGames(options?: { paging?: V4Types.Request.Paging, raw?: boolean, query?: V4Types.Request.GamesQuery, perPage?: number }): AsyncGenerator<Game[] | V4Types.Games.Raw, void, unknown>;
    /**
     * Renvoie les jeux vidéo situés à une page particulière et satisfaisant au `query` donné.
     *
     * @example
     * ```ts
     * console.log(await V4.getGames({ page: 2 }));
     * ```
     * 
     * @param  {{ page: number, raw?: boolean, query?: V4Types.Request.GamesQuery, perPage?: number }} options 
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Games.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Game})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 20
     * @param {V4Types.Request.GamesQuery} [options.query] à renseigner pour affiner la recherche
     * @returns {(AsyncGenerator<Game[] | V4Types.Games.Raw, void, unknown>)} 
     */
    static getGames(options: { page: number, raw?: boolean, query?: V4Types.Request.GamesQuery, perPage?: number }): AsyncGenerator<Game[] | V4Types.Games.Raw, void, unknown>;
    static getGames({ raw = false, page, paging = {}, perPage = DEFAULT_PER_PAGE, query = {} }: V4Types.Request.GamesOptions = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = 'games';
    
        if (page !== undefined) {
            return request(route, { raw, query: { ...query, page, perPage }, type: "game" });
        }
        
        return generator(route, paging, { raw, query: { ...query, page, perPage }, type: "game" });
    }
    
    /**
     * @hidden
     */
    static getGamesReleases(options: V4Types.Request.ReleasesOptions & { page: number, raw: true }): Promise<V4Types.Games.Raw>;
    /**
     * @hidden
     */
    static getGamesReleases(options: V4Types.Request.ReleasesOptions & { page: number }): Promise<Game[]>;
    /**
     * @hidden
     */
    static getGamesReleases(options: V4Types.Request.ReleasesOptions & { raw: true }): AsyncGenerator<V4Types.Games.Raw, void, unknown>;
    /**
     * @hidden
     */
    static getGamesReleases(options?: V4Types.Request.ReleasesOptions): AsyncGenerator<Game[], void, unknown>;
    /**
     * Renvoie un générateur asynchrone des sorties de jeux vidéo situées aux pages décrites par le paramètre `paging` et satisfaisant au `query` donné.
     * 
     * @example
     * ```ts
     * for await (const page of V4.getGamesReleases()) {
     *      console.log(page);
     * }
     * ```
     * 
     * @param  {{ paging?: V4Types.Request.Paging, raw?: boolean, query?: V4Types.Request.ReleasesQuery, perPage?: number }} [options] 
     * @param {V4Types.Request.Paging} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Games.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Game})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 20
     * @param {V4Types.Request.GamesQuery} [options.query] à renseigner pour affiner la recherche
     * @returns {(AsyncGenerator<Game[] | V4Types.Games.Raw, void, unknown>)}
     */
    static getGamesReleases(options?: { paging?: V4Types.Request.Paging, raw?: boolean, query?: V4Types.Request.ReleasesQuery, perPage?: number }): AsyncGenerator<Game[] | V4Types.Games.Raw, void, unknown>;
    /**
     * Renvoie les sorties de jeux vidéo situés à une page particulière et satisfaisant au `query` donné.
     * 
     * @example
     * ```ts
     * console.log(await V4.getGamesReleases({ page: 2 }));
     * ```
     * 
     * @param  {{ paging?: V4Types.Request.Paging, raw?: boolean, query?: V4Types.Request.ReleasesQuery, perPage?: number }} [options] 
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Games.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Game})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 20
     * @param {V4Types.Request.GamesQuery} [options.query] à renseigner pour affiner la recherche
     * @returns {(Promise<Game[] | V4Types.Games.Raw>)}
     */
    static getGamesReleases(options: { page: number, raw?: boolean, query?: V4Types.Request.ReleasesQuery, perPage?: number }): AsyncGenerator<Game[] | V4Types.Games.Raw, void, unknown>;
    static getGamesReleases({ raw = false, page, paging = {}, perPage = DEFAULT_PER_PAGE, query = {} }: V4Types.Request.ReleasesOptions = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = 'games/releases';
    
        if (page !== undefined) {
            return request(route, { raw, query: { ...query, page, perPage }, type: "game" });
        }
        
        return generator(route, paging, { raw, query: { ...query, page, perPage }, type: "game" });
    }
    
    /**
     * @hidden
     */
    static searchArticles(q: string, options: V4Types.Request.Options & { page: number, raw: true }): Promise<V4Types.Contents.Raw>;
    /**
     * @hidden
     */
    static searchArticles(q: string, options: V4Types.Request.Options & { page: number }): Promise<Content[]>;
    /**
     * @hidden
     */
    static searchArticles(q: string, options: V4Types.Request.Options & { raw: true }): AsyncGenerator<V4Types.Contents.Raw, void, unknown>;
    /**
     * @hidden
     */
    static searchArticles(q: string, options?: V4Types.Request.Options): AsyncGenerator<Content[], void, unknown>;
    /**
     * Renvoie un générateur asynchrone des articles correspondant aux termes de recherche et situés aux pages décrites par le paramètre `paging`.
     * 
     * @example
     * ```ts
     * for await (const page of V4.searchArticles("test")) {
     *      console.log(page);
     * }
     * ```
     * 
     * @param  {string} q termes de recherche
     * @param  {{ paging?: V4Types.Request.Paging, raw?: boolean, perPage?: number }} [options]
     * @param {V4Types.Request.Paging} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Contents.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 20
     * @returns {(AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>)} 
     */
    static searchArticles(q: string, options?: { paging?: V4Types.Request.Paging, raw?: boolean, perPage?: number }): AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>;
    /**
     * Renvoie les articles correspondant aux termes de recherche et situés à une page particulière.
     * 
     * @example
     * ```ts
     * console.log(await V4.searchArticles("test", { page: 2 }));
     * ```
     * 
     * @param {string} q termes de recherche
     * @param {{ page: number, raw?: boolean, perPage?: number }} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Contents.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 20 
     * @returns {(Promise<Content[] | V4Types.Contents.Raw>)} 
     */
    static searchArticles(q: string, options: { page: number, raw?: boolean, perPage?: number }): Promise<Content[] | V4Types.Contents.Raw>;
    static searchArticles(q: string, { raw = false, page = undefined, paging = {}, perPage = DEFAULT_PER_PAGE }: V4Types.Request.Options = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = 'search/articles';
    
        if (page !== undefined) {
            return request(route, { raw, query: { q, page, perPage } });
        }
    
        return generator(route, paging, { raw, query: { q, perPage } });
    }
    
    /**
     * @hidden
     */
    static searchGames(q: string, options: V4Types.Request.Options & { page: number, raw: true }): Promise<V4Types.Games.Raw>;
    /**
     * @hidden
     */
    static searchGames(q: string, options: V4Types.Request.Options & { page: number }): Promise<Game[]>;
    /**
     * @hidden
     */
    static searchGames(q: string, options: V4Types.Request.Options & { raw: true }): AsyncGenerator<V4Types.Games.Raw, void, unknown>;
    /**
     * @hidden
     */
    static searchGames(q: string, options?: V4Types.Request.Options): AsyncGenerator<Game[], void, unknown>;
    /**
     * Renvoie un générateur asynchrone des jeux correspondant aux termes de recherche et situés aux pages décrites par le paramètre `paging`.
     * 
     * @example
     * ```ts
     * for await (const page of V4.searchGames("test")) {
     *      console.log(page);
     * }
     * ```
     * 
     * @param  {string} q termes de recherche
     * @param  {{ paging?: V4Types.Request.Paging, raw?: boolean, perPage?: number }} [options]
     * @param {V4Types.Request.Paging} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Games.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Game})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 20
     * @returns {(AsyncGenerator<Game[] | V4Types.Games.Raw, void, unknown>)} 
     */
    static searchGames(q: string, options?: { paging?: V4Types.Request.Paging, raw?: boolean, perPage?: number }): AsyncGenerator<Game[] | V4Types.Games.Raw, void, unknown>;
    /**
     * Renvoie les jeux correspondant aux termes de recherche et situés à une page particulière.
     * 
     * @example
     * ```ts
     * console.log(await V4.searchGames("test", { page: 2 }));
     * ```
     * 
     * @param {string} q termes de recherche
     * @param {{ page: number, raw?: boolean, perPage?: number }} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Games.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Game})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 20 
     * @returns {(Promise<Game[] | V4Types.Games.Raw>)} 
     */
    static searchGames(q: string, options: { page: number, raw?: boolean, perPage?: number }): Promise<Game[] | V4Types.Games.Raw>;
    static searchGames(q: string, { raw = false, page = undefined, paging = {}, perPage = DEFAULT_PER_PAGE }: V4Types.Request.Options = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = 'search/games';
    
        if (page !== undefined) {
            return request(route, { raw, query: { q, page, perPage }, type: "game" })
        }
    
        return generator(route, paging, { raw, type: "game", query: { q, perPage } });
    }
    
    /**
     * @hidden
     */
    static searchNews(q: string, options: V4Types.Request.Options & { page: number, raw: true }): Promise<V4Types.Contents.Raw>;
    /**
     * @hidden
     */
    static searchNews(q: string, options: V4Types.Request.Options & { page: number }): Promise<Content[]>;
     /**
     * @hidden
     */
    static searchNews(q: string, options: V4Types.Request.Options & { raw: true }): AsyncGenerator<V4Types.Contents.Raw, void, unknown>;
    /**
     * @hidden
     */
    static searchNews(q: string, options?: V4Types.Request.Options): AsyncGenerator<Content[], void, unknown>;
    /**
     * Renvoie un générateur asynchrone des news correspondant aux termes de recherche et situées aux pages décrites par le paramètre `paging`.
     * 
     * @example
     * ```ts
     * for await (const page of V4.searchNews("test")) {
     *      console.log(page);
     * }
     * ```
     * 
     * @param {string} q termes de recherche
     * @param {{ paging?: V4Types.Request.Paging, raw?: boolean, perPage?: number }} [options]
     * @param {V4Types.Request.Paging} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Contents.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 20
     * @returns {(AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>)} 
     */
    static searchNews(q: string, options?: { paging?: V4Types.Request.Paging, raw?: boolean, perPage?: number }): AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>;
    /**
     * Renvoie les news correspondant aux termes de recherche et situées à une page particulière.
     * 
     * @example
     * ```ts
     * console.log(await V4.searchNews("test", { page: 2 }));
     * ```
     * 
     * @param {string} q termes de recherche
     * @param {{ page: number, raw?: boolean, perPage?: number }} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Contents.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 20 
     * @returns {(Promise<Content[] | V4Types.Contents.Raw>)} 
     */
    static searchNews(q: string, options: { page: number, raw?: boolean, perPage?: number }): Promise<Content[] | V4Types.Contents.Raw>;
    static searchNews(q: string, { raw = false, page = undefined, paging = {}, perPage = DEFAULT_PER_PAGE }: V4Types.Request.Options = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = 'search/news';
    
        if (page !== undefined) {
            return request(route, { raw, query: { q, page, perPage } });
        }
            
        return generator(route, paging, { raw, query: { q, perPage } });
    }
    
    /**
     * @hidden
     */
    static searchVideos(q: string, options: V4Types.Request.Options & { page: number, raw: true }): Promise<V4Types.Videos.Raw>;
    /**
     * @hidden
     */
    static searchVideos(q: string, options: V4Types.Request.Options & { page: number }): Promise<Video[]>;
    /**
     * @hidden
     */
    static searchVideos(q: string, options: V4Types.Request.Options & { raw: true }): AsyncGenerator<V4Types.Videos.Raw, void, unknown>;
    /**
     * @hidden
     */
    static searchVideos(q: string, options?: V4Types.Request.Options): AsyncGenerator<Video[], void, unknown>;
    /**
     * Renvoie un générateur asynchrone des vidéos correspondant aux termes de recherche et situées aux pages décrites par le paramètre `paging`.
     * 
     * @example
     * ```ts
     * for await (const page of V4.searchVideos("test")) {
     *      console.log(page);
     * }
     * ```
     * 
     * @param  {string} q termes de recherche
     * @param  {{ paging?: V4Types.Request.Paging, raw?: boolean, perPage?: number }} [options]
     * @param {V4Types.Request.Paging} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Videos.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Video})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 20
     * @returns {(AsyncGenerator<Video[] | V4Types.Videos.Raw, void, unknown>)} 
     */
    static searchVideos(q: string, options?: { paging?: V4Types.Request.Paging, raw?: boolean, perPage?: number }): AsyncGenerator<Video[] | V4Types.Videos.Raw, void, unknown>;
    /**
     * Renvoie les vidéos correspondant aux termes de recherche et situées à une page particulière.
     * 
     * @example
     * ```ts
     * console.log(await V4.searchVideos("test", { page: 2 }));
     * ```
     * 
     * @param {string} q termes de recherche
     * @param {{ page: number, raw?: boolean, perPage?: number }} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Videos.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Video})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 20 
     * @returns {(Promise<Video[] | V4Types.Videos.Raw>)} 
     */
    static searchVideos(q: string, options: { page: number, raw?: boolean, perPage?: number }): Promise<Video[] | V4Types.Videos.Raw>;
    static searchVideos(q: string, { raw = false, page = undefined, paging = {}, perPage = DEFAULT_PER_PAGE }: V4Types.Request.Options = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = 'search/videos';
    
        if (page !== undefined) {
            return request(route, { raw, query: { q, page, perPage }, type: "video" });
        }
        
        return generator(route, paging, { raw, type: "video", query: { q, perPage } });
    }
    
    /**
     * @hidden
     */
    static searchWikis(q: string, options: V4Types.Request.Options & { page: number, raw: true }): Promise<V4Types.Contents.Raw>;
    /**
     * @hidden
     */
    static searchWikis(q: string, options: V4Types.Request.Options & { page: number }): Promise<Content[]>;
    /**
     * @hidden
     */
    static searchWikis(q: string, options: V4Types.Request.Options & { raw: true }): AsyncGenerator<V4Types.Contents.Raw, void, unknown>;
    /**
     * @hidden
     */
    static searchWikis(q: string, options?: V4Types.Request.Options): AsyncGenerator<Content[], void, unknown>;
    /**
     * Renvoie un générateur asynchrone des wikis correspondant aux termes de recherche et situés aux pages décrites par le paramètre `paging`.
     * 
     * @example
     * ```ts
     * for await (const page of V4.searchWikis("test")) {
     *      console.log(page);
     * }
     * ```
     * 
     * @param {string} q termes de recherche
     * @param {{ paging?: V4Types.Request.Paging, raw?: boolean, perPage?: number }} [options]
     * @param {V4Types.Request.Paging} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Contents.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 20
     * @returns {(AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>)} 
     */
    static searchWikis(q: string, options?: { paging?: V4Types.Request.Paging, raw?: boolean, perPage?: number }): AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>;
    /**
     * Renvoie les wikis correspondant aux termes de recherche et situés à une page particulière.
     * 
     * @example
     * ```ts
     * console.log(await V4.searchWikis("test", { page: 2 }));
     * ```
     * 
     * @param {string} q termes de recherche
     * @param {{ page: number, raw?: boolean, perPage?: number }} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Contents.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 20 
     * @returns {(Promise<Content[] | V4Types.Contents.Raw>)} 
     */
    static searchWikis(q: string, options: { page: number, raw?: boolean, perPage?: number }): Promise<Content[] | V4Types.Contents.Raw>;
    static searchWikis(q: string, { raw = false, page = undefined, paging = {}, perPage = DEFAULT_PER_PAGE }: V4Types.Request.Options = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = 'search/wikis';
    
        if (page !== undefined) {
            return request(route, { raw, query: { q, page, perPage } });
        }
        
        return generator(route, paging, { raw, query: { q, perPage } });
    }
    
    /**
     * @hidden
     */
    private static search(q: string, options: { raw: true }): Promise<V4Types.SearchResult.RawSearchResult>;
    /**
     * @hidden
     */
    private static search(q: string, options?: { raw?: boolean }): Promise<V4Types.SearchResult.SearchResult>;
    /**
     * Renvoie des résultats globaux de recherche concernant les jeux vidéo, news, articles, videos, wikis. 
     *
     * @hidden
     * @param {string} q termes de recherche
     * @param {{ raw?: boolean }} [options]
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.SearchResult.RawSearchResult}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link V4Types.SearchResult.SearchResult})
     * @return {(Promise<V4Types.SearchResult.RawSearchResult | V4Types.SearchResult.SearchResult>)} 
     */
    private static search(q: string, options?: { raw?: boolean }): Promise<V4Types.SearchResult.RawSearchResult | V4Types.SearchResult.SearchResult>;
    private static async search(q: string, { raw = false } = {}): Promise<any> {
        const response = await callApi('search', { query: { q } });
        const data = await response.json();
    
        return raw ? data : {
            games: data.games.items.map((g: V4Types.Game.Generic) => new Game(g.id)),
            news: data.news.items.map((c: V4Types.Content.Generic) => new Content(c.id)),
            articles: data.articles.items.map((c: V4Types.Content.Generic) => new Content(c.id)),
            videos: data.videos.items.map((v: V4Types.Video.Infos) => new Video(v.id)),
            wikis: data.wikis.items.map((c: V4Types.Content.Generic) => new Content(c.id))
        }
    }
}