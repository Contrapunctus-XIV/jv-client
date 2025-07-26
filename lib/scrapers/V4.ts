/**
 * @module scrapers
 */

import { requestApi } from "../requests.js";
import Content, { Video } from "../classes/Content.js";
import Game from "../classes/Game.js";
import { DEFAULT_PER_PAGE } from "../vars.js";
import { LibTypes, V4Types } from "../types/index.js";

function generator(route: string, paging: LibTypes.Args.Pagination, options: LibTypes.Args.Raw<LibTypes.Args.V4.RequestOptions<"video">>): AsyncGenerator<V4Types.Videos.Raw, void, unknown>;
function generator(route: string, paging: LibTypes.Args.Pagination, options: LibTypes.Args.Raw<LibTypes.Args.V4.RequestOptions<"game">>): AsyncGenerator<V4Types.Games.Raw, void, unknown>;
function generator(route: string, paging: LibTypes.Args.Pagination, options: LibTypes.Args.Raw<LibTypes.Args.V4.RequestOptions<"hightech">>): AsyncGenerator<V4Types.Contents.RawHighTech, void, unknown>;
function generator(route: string, paging: LibTypes.Args.Pagination, options: LibTypes.Args.Raw<LibTypes.Args.V4.RequestOptions>): AsyncGenerator<V4Types.Contents.Raw, void, unknown>;
function generator(route: string, paging: LibTypes.Args.Pagination, options: LibTypes.Args.NotRaw<LibTypes.Args.V4.RequestOptions<"video">>): AsyncGenerator<Video[], void, unknown>;
function generator(route: string, paging: LibTypes.Args.Pagination, options: LibTypes.Args.NotRaw<LibTypes.Args.V4.RequestOptions<"game">>): AsyncGenerator<Game[], void, unknown>;
function generator(route: string, paging: LibTypes.Args.Pagination, options: LibTypes.Args.NotRaw<LibTypes.Args.V4.RequestOptions<"hightech">>): AsyncGenerator<V4Types.Contents.HighTech, void, unknown>;
function generator(route: string, paging: LibTypes.Args.Pagination, options?: LibTypes.Args.NotRaw<LibTypes.Args.V4.RequestOptions>): AsyncGenerator<Content[], void, unknown>;
function generator(route: string, paging: LibTypes.Args.Pagination, { query = {}, raw = false, type = "content" }: LibTypes.Args.NotRaw<LibTypes.Args.V4.RequestOptions> = {}) {
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

function request(route: string, options: LibTypes.Args.Raw<LibTypes.Args.V4.RequestOptions<"video">>): Promise<V4Types.Videos.Raw>;
function request(route: string, options: LibTypes.Args.Raw<LibTypes.Args.V4.RequestOptions<"game">>): Promise<V4Types.Games.Raw>;
function request(route: string, options: LibTypes.Args.Raw<LibTypes.Args.V4.RequestOptions<"hightech">>): Promise<V4Types.Contents.RawHighTech>;
function request(route: string, options: LibTypes.Args.Raw<LibTypes.Args.V4.RequestOptions>): Promise<V4Types.Contents.Raw>;
function request(route: string, options: LibTypes.Args.NotRaw<LibTypes.Args.V4.RequestOptions<"video">>): Promise<Video[]>;
function request(route: string, options: LibTypes.Args.NotRaw<LibTypes.Args.V4.RequestOptions<"game">>): Promise<Game[]>;
function request(route: string, options: LibTypes.Args.NotRaw<LibTypes.Args.V4.RequestOptions<"hightech">>): Promise<V4Types.Contents.HighTech>;
function request(route: string, options?: LibTypes.Args.NotRaw<LibTypes.Args.V4.RequestOptions>): Promise<Content[]>;
function request(route: string, { query = {}, raw = false, type = "content" }: LibTypes.Args.NotRaw<LibTypes.Args.V4.RequestOptions> = {}) {
    return requestApi(route, { query })
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
 * Classe contenant des méthodes statiques permettant de récupérer des jeux vidéo et des contenus selon des critères précis grâce à l'API `v4`.
 * @abstract
 * @hideconstructor
 */
export default abstract class V4 {
    /**
     * @hidden
     */
    static getContents(options: LibTypes.Args.RawAndPage<LibTypes.Args.V4.ContentsOptions>): Promise<V4Types.Contents.Raw>;
    /**
     * @hidden
     */
    static getContents(options: LibTypes.Args.Page<LibTypes.Args.V4.ContentsOptions>): Promise<Content[]>;
    /**
     * @hidden
     */
    static getContents(options: LibTypes.Args.RawAndPaging<LibTypes.Args.V4.ContentsOptions>): AsyncGenerator<V4Types.Contents.Raw, void, unknown>;
    /**
     * @hidden
     */
    static getContents(options?: LibTypes.Args.Paging<LibTypes.Args.V4.ContentsOptions>): AsyncGenerator<Content[], void, unknown>;
    /**
     * Renvoie un générateur asynchrone des contenus (actualités, articles, wikis...) situés aux pages décrites par le paramètre `paging` et satisfaisant au `query` donné.
     * 
     * @example
     * ```ts
     * for await (const page of V4.getContents()) {
     *      console.log(page);
     * }
     * ```
     * @param {LibTypes.Args.Paging<LibTypes.Args.V4.ContentsOptions>} [options]
     * @param {LibTypes.Args.Pagination} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Contents.Raw | `V4Types.Contents.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content | `Content`})
     * @param {V4Types.Request.ContentsQuery} [options.query] à renseigner pour affiner la recherche
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @returns {(AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>)}
     */
    static getContents(options?: LibTypes.Args.Paging<LibTypes.Args.V4.ContentsOptions>): AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>;
    /**
     * Renvoie les contenus (actualités, articles, wikis...) situés à une page particulière et satisfaisant au `query` donné.
     *
     * @example
     * ```ts
     * console.log(await V4.getContents({ page: 2 }));
     * ```
     * @param {LibTypes.Args.Page<LibTypes.Args.V4.ContentsOptions>} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Contents.Raw | `V4Types.Contents.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content | `Content`})
     * @param {V4Types.Request.ContentsQuery} [options.query] à renseigner pour affiner la recherche
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @returns {(Promise<Content[] | V4Types.Contents.Raw>)}
     */
    static getContents(options: LibTypes.Args.Page<LibTypes.Args.V4.ContentsOptions>): Promise<Content[] | V4Types.Contents.Raw>;
    static getContents({ raw = false, page, paging = {}, perPage = DEFAULT_PER_PAGE, query = {} }: LibTypes.Args.PageOrPaging<LibTypes.Args.V4.ContentsOptions> = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = 'contents';
    
        if (page !== undefined) {
            return request(route, { raw, query: { ...query, page, perPage } });
        }
            
        return generator(route, paging, { raw, query: { ...query, page, perPage } });
    }
    
    /**
     * @hidden
     */
    static getHighTechContents(options: LibTypes.Args.RawAndPage<LibTypes.Args.Base>): Promise<V4Types.Contents.RawHighTech>;
    /**
     * @hidden
     */
    static getHighTechContents(options: LibTypes.Args.Page<LibTypes.Args.Base>): Promise<V4Types.Contents.HighTech>;
    /**
     * @hidden
     */
    static getHighTechContents(options: LibTypes.Args.RawAndPaging<LibTypes.Args.Base>): AsyncGenerator<V4Types.Contents.RawHighTech, void, unknown>;
    /**
     * @hidden
     */
    static getHighTechContents(options?: LibTypes.Args.Paging<LibTypes.Args.Base>): AsyncGenerator<V4Types.Contents.HighTech, void, unknown>;
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
     * @param  {LibTypes.Args.Paging<LibTypes.Args.Base>} [options]
     * @param {LibTypes.Args.Pagination} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Contents.RawHighTech | `V4Types.Contents.RawHighTech`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link V4Types.Contents.HighTech | `V4Types.Contents.HighTech`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @returns {(AsyncGenerator<V4Types.Contents.HighTech | V4Types.Contents.RawHighTech, void, unknown>)}
     */
    static getHighTechContents(options?: LibTypes.Args.Paging<LibTypes.Args.Base>): AsyncGenerator<V4Types.Contents.HighTech | V4Types.Contents.RawHighTech, void, unknown>;
    /**
     * Renvoie les contenus high-tech situés à une page particulière.
     * 
     * @example
     * ```ts
     * console.log(await V4.getHighTechContents({ page: 2 }));
     * ```
     * 
     * @param  {LibTypes.Args.Page<LibTypes.Args.Base>} options 
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Contents.RawHighTech | `V4Types.Contents.RawHighTech`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link V4Types.Contents.HighTech | `V4Types.Contents.HighTech`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @returns {(Promise<V4Types.Contents.HighTech | V4Types.Contents.RawHighTech>)} 
     */
    static getHighTechContents(options: LibTypes.Args.Page<LibTypes.Args.Base>): Promise<V4Types.Contents.HighTech | V4Types.Contents.RawHighTech>;
    static getHighTechContents({ raw = false, page, paging = {}, perPage = DEFAULT_PER_PAGE }: LibTypes.Args.PageOrPaging<LibTypes.Args.Base> = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = 'contents/hightech';
    
        if (page !== undefined) {
            return request(route, { raw, query: { page, perPage }, type: "hightech" });
        }
    
        return generator(route, paging, { raw, query: { page, perPage }, type: "hightech" });
    }
    
    /**
     * @hidden
     */
    static getTrendingContents(options: LibTypes.Args.RawAndPage<LibTypes.Args.Base>): Promise<V4Types.Contents.Raw>;
    /**
     * @hidden
     */
    static getTrendingContents(options: LibTypes.Args.Page<LibTypes.Args.Base>): Promise<Content[]>;
    /**
     * @hidden
     */
    static getTrendingContents(options: LibTypes.Args.RawAndPaging<LibTypes.Args.Base>): AsyncGenerator<V4Types.Contents.Raw, void, unknown>;
    /**
     * @hidden
     */
    static getTrendingContents(options?: LibTypes.Args.Paging<LibTypes.Args.Base>): AsyncGenerator<Content[], void, unknown>;
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
     * @param  {LibTypes.Args.Paging<LibTypes.Args.Base>} [options]
     * @param {LibTypes.Args.Pagination} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Contents.Raw | `V4Types.Contents.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content | `Content`})
     * @param {boolean} [options.perPage] nombre d'entités par page, par défaut `20`
     * @returns {(AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>)}
     */
    static getTrendingContents(options?: LibTypes.Args.Paging<LibTypes.Args.Base>): AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>;
    /**
     * Renvoie les contenus tendance situés à une page particulière.
     * 
     * @example
     * ```ts
     * console.log(await V4.getTrendingContents({ page: 2 }));
     * ```
     * 
     * @param  {LibTypes.Args.Page<LibTypes.Args.Base>} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Contents.Raw | `V4Types.Contents.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content | `Content`})
     * @param {boolean} [options.perPage] nombre d'entités par page, par défaut `20`
     * @returns {(Promise<Content[] | V4Types.Contents.Raw>)} 
     */
    static getTrendingContents(options: LibTypes.Args.Page<LibTypes.Args.Base>): Promise<Content[] | V4Types.Contents.Raw>;
    static getTrendingContents({ raw = false, page, paging = {}, perPage = DEFAULT_PER_PAGE }: LibTypes.Args.PageOrPaging<LibTypes.Args.Base> = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = 'contents/trending';
    
        if (page !== undefined) {
            return request(route, { raw, query: { page, perPage } });
        }
            
        return generator(route, paging, { raw, query: { page, perPage } });
    }
    
    /**
     * @hidden
     */
    static getGamesSummary(options: LibTypes.Args.Raw): Promise<V4Types.Games.RawSummary>;
    /**
     * @hidden
     */
    static getGamesSummary(options?: LibTypes.Args.NotRaw): Promise<V4Types.Games.Summary>;
    /**
     * Renvoie un sommaire contenant les contenus du moment portant sur des jeux vidéo.
     * 
     * @param  {LibTypes.Args.NotRaw} [options]
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Games.RawSummary | `V4Types.Games.RawSummary`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link V4Types.Games.Summary | `V4Types.Games.Summary`})
     * @returns {(Promise<V4Types.Games.Summary | V4Types.Games.RawSummary>)}
     */
    static getGamesSummary(options?: LibTypes.Args.NotRaw): Promise<V4Types.Games.Summary | V4Types.Games.RawSummary>;
    static async getGamesSummary({ raw = false }: LibTypes.Args.NotRaw = {}) {
        const route = 'contents/games';
    
        const response = await requestApi(route);
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
    static getGames(options: LibTypes.Args.RawAndPage<LibTypes.Args.V4.GamesOptions>): Promise<V4Types.Games.Raw>;
    /**
     * @hidden
     */
    static getGames(options: LibTypes.Args.Page<LibTypes.Args.V4.GamesOptions>): Promise<Game[]>;
    /**
     * @hidden
     */
    static getGames(options: LibTypes.Args.RawAndPaging<LibTypes.Args.V4.GamesOptions>): AsyncGenerator<V4Types.Games.Raw, void, unknown>;
    /**
     * @hidden
     */
    static getGames(options?: LibTypes.Args.Paging<LibTypes.Args.V4.GamesOptions>): AsyncGenerator<Game[], void, unknown>;
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
     * @param  {LibTypes.Args.Paging<LibTypes.Args.V4.GamesOptions>} [options]
     * @param {LibTypes.Args.Pagination} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Games.Raw | `V4Types.Games.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Game | `Game`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @param {V4Types.Request.ContentsQuery} [options.query] à renseigner pour affiner la recherche
     * @returns {(AsyncGenerator<Game[] | V4Types.Games.Raw, void, unknown>)} 
     */
    static getGames(options?: LibTypes.Args.Paging<LibTypes.Args.V4.GamesOptions>): AsyncGenerator<Game[] | V4Types.Games.Raw, void, unknown>;
    /**
     * Renvoie les jeux vidéo situés à une page particulière et satisfaisant au `query` donné.
     *
     * @example
     * ```ts
     * console.log(await V4.getGames({ page: 2 }));
     * ```
     * 
     * @param  {LibTypes.Args.Page<LibTypes.Args.V4.GamesOptions>} options 
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Games.Raw | `V4Types.Games.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Game | `Game`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @param {V4Types.Request.GamesQuery} [options.query] à renseigner pour affiner la recherche
     * @returns {(AsyncGenerator<Game[] | V4Types.Games.Raw, void, unknown>)} 
     */
    static getGames(options: LibTypes.Args.Page<LibTypes.Args.V4.GamesOptions>): AsyncGenerator<Game[] | V4Types.Games.Raw, void, unknown>;
    static getGames({ raw = false, page, paging = {}, perPage = DEFAULT_PER_PAGE, query = {} }: LibTypes.Args.PageOrPaging<LibTypes.Args.V4.GamesOptions> = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = 'games';
    
        if (page !== undefined) {
            return request(route, { raw, query: { ...query, page, perPage }, type: "game" });
        }
        
        return generator(route, paging, { raw, query: { ...query, page, perPage }, type: "game" });
    }
    
    /**
     * @hidden
     */
    static getGamesReleases(options: LibTypes.Args.RawAndPage<LibTypes.Args.V4.ReleasesOptions>): Promise<V4Types.Games.Raw>;
    /**
     * @hidden
     */
    static getGamesReleases(options: LibTypes.Args.Page<LibTypes.Args.V4.ReleasesOptions>): Promise<Game[]>;
    /**
     * @hidden
     */
    static getGamesReleases(options: LibTypes.Args.RawAndPaging<LibTypes.Args.V4.ReleasesOptions>): AsyncGenerator<V4Types.Games.Raw, void, unknown>;
    /**
     * @hidden
     */
    static getGamesReleases(options?: LibTypes.Args.Paging<LibTypes.Args.V4.ReleasesOptions>): AsyncGenerator<Game[], void, unknown>;
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
     * @param  {LibTypes.Args.Paging<LibTypes.Args.V4.ReleasesOptions>} [options] 
     * @param {LibTypes.Args.Pagination} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Games.Raw | `V4Types.Games.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Game | `Game`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @param {V4Types.Request.GamesQuery} [options.query] à renseigner pour affiner la recherche
     * @returns {(AsyncGenerator<Game[] | V4Types.Games.Raw, void, unknown>)}
     */
    static getGamesReleases(options?: LibTypes.Args.Paging<LibTypes.Args.V4.ReleasesOptions>): AsyncGenerator<Game[] | V4Types.Games.Raw, void, unknown>;
    /**
     * Renvoie les sorties de jeux vidéo situés à une page particulière et satisfaisant au `query` donné.
     * 
     * @example
     * ```ts
     * console.log(await V4.getGamesReleases({ page: 2 }));
     * ```
     * 
     * @param  {LibTypes.Args.Page<LibTypes.Args.V4.ReleasesOptions>} [options] 
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Games.Raw | `V4Types.Games.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Game | `Game`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @param {V4Types.Request.GamesQuery} [options.query] à renseigner pour affiner la recherche
     * @returns {(Promise<Game[] | V4Types.Games.Raw>)}
     */
    static getGamesReleases(options: LibTypes.Args.Page<LibTypes.Args.V4.ReleasesOptions>): AsyncGenerator<Game[] | V4Types.Games.Raw, void, unknown>;
    static getGamesReleases({ raw = false, page, paging = {}, perPage = DEFAULT_PER_PAGE, query = {} }: LibTypes.Args.PageOrPaging<LibTypes.Args.V4.ReleasesOptions> = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = 'games/releases';
    
        if (page !== undefined) {
            return request(route, { raw, query: { ...query, page, perPage }, type: "game" });
        }
        
        return generator(route, paging, { raw, query: { ...query, page, perPage }, type: "game" });
    }
    
    /**
     * @hidden
     */
    static searchArticles(q: string, options: LibTypes.Args.RawAndPage<LibTypes.Args.Base>): Promise<V4Types.Contents.Raw>;
    /**
     * @hidden
     */
    static searchArticles(q: string, options: LibTypes.Args.Page<LibTypes.Args.Base>): Promise<Content[]>;
    /**
     * @hidden
     */
    static searchArticles(q: string, options: LibTypes.Args.RawAndPaging<LibTypes.Args.Base>): AsyncGenerator<V4Types.Contents.Raw, void, unknown>;
    /**
     * @hidden
     */
    static searchArticles(q: string, options?: LibTypes.Args.Paging<LibTypes.Args.Base>): AsyncGenerator<Content[], void, unknown>;
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
     * @param  {LibTypes.Args.Paging<LibTypes.Args.Base>} [options]
     * @param {LibTypes.Args.Pagination} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Contents.Raw | `V4Types.Contents.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content | `Content`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @returns {(AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>)} 
     */
    static searchArticles(q: string, options?: LibTypes.Args.Paging<LibTypes.Args.Base>): AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>;
    /**
     * Renvoie les articles correspondant aux termes de recherche et situés à une page particulière.
     * 
     * @example
     * ```ts
     * console.log(await V4.searchArticles("test", { page: 2 }));
     * ```
     * 
     * @param {string} q termes de recherche
     * @param {LibTypes.Args.Page<LibTypes.Args.Base>} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Contents.Raw | `V4Types.Contents.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content | `Content`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @returns {(Promise<Content[] | V4Types.Contents.Raw>)} 
     */
    static searchArticles(q: string, options: LibTypes.Args.Page<LibTypes.Args.Base>): Promise<Content[] | V4Types.Contents.Raw>;
    static searchArticles(q: string, { raw = false, page = undefined, paging = {}, perPage = DEFAULT_PER_PAGE }: LibTypes.Args.PageOrPaging<LibTypes.Args.Base> = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = 'search/articles';
    
        if (page !== undefined) {
            return request(route, { raw, query: { q, page, perPage } });
        }
    
        return generator(route, paging, { raw, query: { q, perPage } });
    }
    
    /**
     * @hidden
     */
    static searchGames(q: string, options: LibTypes.Args.RawAndPage<LibTypes.Args.Base>): Promise<V4Types.Games.Raw>;
    /**
     * @hidden
     */
    static searchGames(q: string, options: LibTypes.Args.Page<LibTypes.Args.Base>): Promise<Game[]>;
    /**
     * @hidden
     */
    static searchGames(q: string, options: LibTypes.Args.RawAndPaging<LibTypes.Args.Base>): AsyncGenerator<V4Types.Games.Raw, void, unknown>;
    /**
     * @hidden
     */
    static searchGames(q: string, options?: LibTypes.Args.Paging<LibTypes.Args.Base>): AsyncGenerator<Game[], void, unknown>;
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
     * @param  {LibTypes.Args.Paging<LibTypes.Args.Base>} [options]
     * @param {LibTypes.Args.Pagination} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Games.Raw | `V4Types.Games.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Game | `Game`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @returns {(AsyncGenerator<Game[] | V4Types.Games.Raw, void, unknown>)} 
     */
    static searchGames(q: string, options?: LibTypes.Args.Paging<LibTypes.Args.Base>): AsyncGenerator<Game[] | V4Types.Games.Raw, void, unknown>;
    /**
     * Renvoie les jeux correspondant aux termes de recherche et situés à une page particulière.
     * 
     * @example
     * ```ts
     * console.log(await V4.searchGames("test", { page: 2 }));
     * ```
     * 
     * @param {string} q termes de recherche
     * @param {LibTypes.Args.Page<LibTypes.Args.Base>} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Games.Raw | `V4Types.Games.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Game | `Game`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @returns {(Promise<Game[] | V4Types.Games.Raw>)} 
     */
    static searchGames(q: string, options: LibTypes.Args.Page<LibTypes.Args.Base>): Promise<Game[] | V4Types.Games.Raw>;
    static searchGames(q: string, { raw = false, page = undefined, paging = {}, perPage = DEFAULT_PER_PAGE }: LibTypes.Args.PageOrPaging<LibTypes.Args.Base> = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = 'search/games';
    
        if (page !== undefined) {
            return request(route, { raw, query: { q, page, perPage }, type: "game" })
        }
    
        return generator(route, paging, { raw, type: "game", query: { q, perPage } });
    }
    
    /**
     * @hidden
     */
    static searchNews(q: string, options: LibTypes.Args.RawAndPage<LibTypes.Args.Base>): Promise<V4Types.Contents.Raw>;
    /**
     * @hidden
     */
    static searchNews(q: string, options: LibTypes.Args.Page<LibTypes.Args.Base>): Promise<Content[]>;
     /**
     * @hidden
     */
    static searchNews(q: string, options: LibTypes.Args.RawAndPaging<LibTypes.Args.Base>): AsyncGenerator<V4Types.Contents.Raw, void, unknown>;
    /**
     * @hidden
     */
    static searchNews(q: string, options?: LibTypes.Args.Paging<LibTypes.Args.Base>): AsyncGenerator<Content[], void, unknown>;
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
     * @param {LibTypes.Args.Paging<LibTypes.Args.Base>} [options]
     * @param {LibTypes.Args.Pagination} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Contents.Raw | `V4Types.Contents.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content | `Content`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @returns {(AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>)} 
     */
    static searchNews(q: string, options?: LibTypes.Args.Paging<LibTypes.Args.Base>): AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>;
    /**
     * Renvoie les news correspondant aux termes de recherche et situées à une page particulière.
     * 
     * @example
     * ```ts
     * console.log(await V4.searchNews("test", { page: 2 }));
     * ```
     * 
     * @param {string} q termes de recherche
     * @param {LibTypes.Args.Page<LibTypes.Args.Base>} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Contents.Raw | `V4Types.Contents.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content | `Content`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @returns {(Promise<Content[] | V4Types.Contents.Raw>)} 
     */
    static searchNews(q: string, options: LibTypes.Args.Page<LibTypes.Args.Base>): Promise<Content[] | V4Types.Contents.Raw>;
    static searchNews(q: string, { raw = false, page = undefined, paging = {}, perPage = DEFAULT_PER_PAGE }: LibTypes.Args.PageOrPaging<LibTypes.Args.Base> = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = 'search/news';
    
        if (page !== undefined) {
            return request(route, { raw, query: { q, page, perPage } });
        }
            
        return generator(route, paging, { raw, query: { q, perPage } });
    }
    
    /**
     * @hidden
     */
    static searchVideos(q: string, options: LibTypes.Args.RawAndPage<LibTypes.Args.Base>): Promise<V4Types.Videos.Raw>;
    /**
     * @hidden
     */
    static searchVideos(q: string, options: LibTypes.Args.Page<LibTypes.Args.Base>): Promise<Video[]>;
    /**
     * @hidden
     */
    static searchVideos(q: string, options: LibTypes.Args.RawAndPaging<LibTypes.Args.Base>): AsyncGenerator<V4Types.Videos.Raw, void, unknown>;
    /**
     * @hidden
     */
    static searchVideos(q: string, options?: LibTypes.Args.Paging<LibTypes.Args.Base>): AsyncGenerator<Video[], void, unknown>;
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
     * @param  {LibTypes.Args.Paging<LibTypes.Args.Base>} [options]
     * @param {LibTypes.Args.Pagination} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Videos.Raw | `V4Types.Videos.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content | `Video`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @returns {(AsyncGenerator<Video[] | V4Types.Videos.Raw, void, unknown>)} 
     */
    static searchVideos(q: string, options?: LibTypes.Args.Paging<LibTypes.Args.Base>): AsyncGenerator<Video[] | V4Types.Videos.Raw, void, unknown>;
    /**
     * Renvoie les vidéos correspondant aux termes de recherche et situées à une page particulière.
     * 
     * @example
     * ```ts
     * console.log(await V4.searchVideos("test", { page: 2 }));
     * ```
     * 
     * @param {string} q termes de recherche
     * @param {LibTypes.Args.Page<LibTypes.Args.Base>} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Videos.Raw | `V4Types.Videos.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content | `Video`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @returns {(Promise<Video[] | V4Types.Videos.Raw>)} 
     */
    static searchVideos(q: string, options: LibTypes.Args.Page<LibTypes.Args.Base>): Promise<Video[] | V4Types.Videos.Raw>;
    static searchVideos(q: string, { raw = false, page = undefined, paging = {}, perPage = DEFAULT_PER_PAGE }: LibTypes.Args.PageOrPaging<LibTypes.Args.Base> = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = 'search/videos';
    
        if (page !== undefined) {
            return request(route, { raw, query: { q, page, perPage }, type: "video" });
        }
        
        return generator(route, paging, { raw, type: "video", query: { q, perPage } });
    }
    
    /**
     * @hidden
     */
    static searchWikis(q: string, options: LibTypes.Args.RawAndPage<LibTypes.Args.Base>): Promise<V4Types.Contents.Raw>;
    /**
     * @hidden
     */
    static searchWikis(q: string, options: LibTypes.Args.Page<LibTypes.Args.Base>): Promise<Content[]>;
    /**
     * @hidden
     */
    static searchWikis(q: string, options: LibTypes.Args.RawAndPaging<LibTypes.Args.Base>): AsyncGenerator<V4Types.Contents.Raw, void, unknown>;
    /**
     * @hidden
     */
    static searchWikis(q: string, options?: LibTypes.Args.Paging<LibTypes.Args.Base>): AsyncGenerator<Content[], void, unknown>;
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
     * @param {LibTypes.Args.Paging<LibTypes.Args.Base>} [options]
     * @param {LibTypes.Args.Pagination} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Contents.Raw | `V4Types.Contents.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content | `Content`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @returns {(AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>)} 
     */
    static searchWikis(q: string, options?: LibTypes.Args.Paging<LibTypes.Args.Base>): AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>;
    /**
     * Renvoie les wikis correspondant aux termes de recherche et situés à une page particulière.
     * 
     * @example
     * ```ts
     * console.log(await V4.searchWikis("test", { page: 2 }));
     * ```
     * 
     * @param {string} q termes de recherche
     * @param {LibTypes.Args.Page<LibTypes.Args.Base>} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Contents.Raw | `V4Types.Contents.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content | `Content`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @returns {(Promise<Content[] | V4Types.Contents.Raw>)} 
     */
    static searchWikis(q: string, options: LibTypes.Args.Page<LibTypes.Args.Base>): Promise<Content[] | V4Types.Contents.Raw>;
    static searchWikis(q: string, { raw = false, page = undefined, paging = {}, perPage = DEFAULT_PER_PAGE }: LibTypes.Args.PageOrPaging<LibTypes.Args.Base> = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
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
        const response = await requestApi('search', { query: { q } });
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