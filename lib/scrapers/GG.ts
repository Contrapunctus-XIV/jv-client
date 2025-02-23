/**
 * @module scrapers
 * @hidden
 */

import Game from "../classes/Game.js";
import { callGG } from "../requests.js";
import Content, { Video } from "../classes/Content.js";
import { DEFAULT_GG_PER_PAGE } from "../vars.js";

function generator(route: string, paging: GGTypes.Request.Paging, options: GGTypes.Request.RequestOptions & { raw: true, type: "news" }): AsyncGenerator<GGTypes.News.Raw, void, unknown>;
function generator(route: string, paging: GGTypes.Request.Paging, options: GGTypes.Request.RequestOptions & { raw: true, type: "review" }): AsyncGenerator<GGTypes.Reviews.Raw, void, unknown>;
function generator(route: string, paging: GGTypes.Request.Paging, options: GGTypes.Request.RequestOptions & { raw: true, type: "preview" }): AsyncGenerator<GGTypes.Previews.Raw, void, unknown>;
function generator(route: string, paging: GGTypes.Request.Paging, options: GGTypes.Request.RequestOptions & { raw: true, type: "video" }): AsyncGenerator<GGTypes.Videos.Raw, void, unknown>;
function generator(route: string, paging: GGTypes.Request.Paging, options: GGTypes.Request.RequestOptions & { raw: true, type: "folder" }): AsyncGenerator<GGTypes.Folders.Raw, void, unknown>;
function generator(route: string, paging: GGTypes.Request.Paging, options: GGTypes.Request.RequestOptions & { raw: true }): AsyncGenerator<GGTypes.Games.Raw, void, unknown>;
function generator(route: string, paging: GGTypes.Request.Paging, options: GGTypes.Request.RequestOptions & { type: "news" }): AsyncGenerator<Content[], void, unknown>;
function generator(route: string, paging: GGTypes.Request.Paging, options: GGTypes.Request.RequestOptions & { type: "review" }): AsyncGenerator<Content[], void, unknown>;
function generator(route: string, paging: GGTypes.Request.Paging, options: GGTypes.Request.RequestOptions & { type: "preview" }): AsyncGenerator<Content[], void, unknown>;
function generator(route: string, paging: GGTypes.Request.Paging, options: GGTypes.Request.RequestOptions & { type: "video" }): AsyncGenerator<Video[], void, unknown>;
function generator(route: string, paging: GGTypes.Request.Paging, options: GGTypes.Request.RequestOptions & { type: "folder" }): AsyncGenerator<Content[], void, unknown>;
function generator(route: string, paging: GGTypes.Request.Paging, options?: GGTypes.Request.RequestOptions): AsyncGenerator<Game[], void, unknown>;
function generator(route: string, paging: GGTypes.Request.Paging, { raw = false, query = {}, type = "game" }: GGTypes.Request.RequestOptions = {}) {
    return (async function* () {
        const { begin = 0, end = null, step = 1 } = paging;
        const perPage = query.perPage ? query.perPage : DEFAULT_GG_PER_PAGE;
        let current = begin;

        while (end ? current <= end - 1 : true) {
            try {
                const offset = current * perPage;
                const data = await request(route, { raw, query: { ...query, offset, limit: perPage }, type }) as any;

                if (raw && (!data || !data.data || data.data.items.length === 0)) break;
                else if (data.length === 0) break;
                yield data;
            } catch (e: any) {
                break;
            }

            current += step;
        }
    })();
}

function request(route: string, options: GGTypes.Request.RequestOptions & { raw: true, type: "news" }): Promise<GGTypes.News.Raw>;
function request(route: string, options: GGTypes.Request.RequestOptions & { raw: true, type: "review" }): Promise<GGTypes.Reviews.Raw>;
function request(route: string, options: GGTypes.Request.RequestOptions & { raw: true, type: "preview" }): Promise<GGTypes.Previews.Raw>;
function request(route: string, options: GGTypes.Request.RequestOptions & { raw: true, type: "video" }): Promise<GGTypes.Videos.Raw>;
function request(route: string, options: GGTypes.Request.RequestOptions & { raw: true, type: "folder" }): Promise<GGTypes.Folders.Raw>;
function request(route: string, options: GGTypes.Request.RequestOptions & { raw: true }): Promise<GGTypes.Games.Raw>;
function request(route: string, options: GGTypes.Request.RequestOptions & { type: "news" }): Promise<Content[]>;
function request(route: string, options: GGTypes.Request.RequestOptions & { type: "review" }): Promise<Content[]>;
function request(route: string, options: GGTypes.Request.RequestOptions & { type: "preview" }): Promise<Content[]>;
function request(route: string, options: GGTypes.Request.RequestOptions & { type: "video" }): Promise<Video[]>;
function request(route: string, options: GGTypes.Request.RequestOptions & { type: "folder" }): Promise<Content[]>;
function request(route: string, options?: GGTypes.Request.RequestOptions): Promise<Game[]>;
function request(route: string, { raw = false, query = {}, type = "game" }: GGTypes.Request.RequestOptions = {}) {
    return callGG(route, { query, allowedStatusErrors: [] })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            switch (type) {
                case "game":
                    return raw ? data as GGTypes.Games.Raw : (data as GGTypes.Games.Raw).data.items.map((g: GGTypes.Game.Infos) => new Game(g.gameId));
                case "news":
                    return raw ? data as GGTypes.News.Raw : (data as GGTypes.News.Raw).data.items.map((n: GGTypes.News.Infos) => new Content(n.publicationId));
                case "review":
                    return raw ? data as GGTypes.Reviews.Raw : (data as GGTypes.Reviews.Raw).data.items.map((r: GGTypes.Review.Infos) => new Content(r.publicationId));
                case "preview":
                    return raw ? data as GGTypes.Previews.Raw : (data as GGTypes.Previews.Raw).data.items.map((p: GGTypes.Preview.Infos) => new Content(p.publicationId));
                case "video":
                    return raw ? data as GGTypes.Videos.Raw : (data as GGTypes.Videos.Raw).data.items.map((v: GGTypes.Video.Infos) => new Video(v.publicationId));
                case "folder":
                    return raw ? data as GGTypes.Folders.Raw : (data as GGTypes.Folders.Raw).data.items.map((f: (GGTypes.Folder.Infos)) => new Content(f.publicationId));
            }
        });
}

function getFilenameFromGameSort(gameSort: GGTypes.Request.Games.Sort): string {
    let filename = gameSort;

    switch (gameSort) {
        case "popularity":
        case "editorialRating":
            filename += ".desc";
            break;
        case "releaseDate":
        case "title":
            filename += ".asc";
            break;
    }

    return filename;
}

function getFileNameFromReviewSort(reviewSort: GGTypes.Request.Reviews.Sort): string {
    let filename = reviewSort;

    switch (reviewSort) {
        case "datePublished":
        case "editorialRating":
            filename += ".desc";
            break;
        case "gameTitle":
            filename += ".asc";
            break;
    }

    return filename;
}

export default abstract class GG {
    /**
     * @hidden
     */
    static getGames(options: GGTypes.Request.Games.Options & { page: number, raw: true }): Promise<GGTypes.Games.Raw>;
    /**
     * @hidden
     */
    static getGames(options: GGTypes.Request.Games.Options & { page: number }): Promise<Game[]>;
    /**
     * @hidden
     */
    static getGames(options: GGTypes.Request.Games.Options & { raw: true }): AsyncGenerator<GGTypes.Games.Raw, void, unknown>;
    /**
     * @hidden
     */
    static getGames(options?: GGTypes.Request.Games.Options): AsyncGenerator<Game[], void, unknown>;
    /**
     * Renvoie un générateur asynchrone des jeux vidéo situés aux pages décrites par le paramètre `paging` et satisfaisant aux arguments donnés.
     *
     * @param {({ paging?: GGTypes.Request.Paging, raw?: boolean, query?: GGTypes.Request.Games.Query, preset?: "all" | "awaited" | "popular" | "best" | "currentBest" | "releases", sort?: "popularity" | "editorialRating" | "releaseDate" | "title", perPage?: number })} [options]
     * @param {GGTypes.Request.Paging} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link GGTypes.Games.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Game})
     * @param {"all" | "awaited" | "popular" | "best" | "currentBest" | "releases"} [options.preset] ensemble d'entités parmi lequel la recherche est faite (par défaut `"all"`)
     * @param {"popularity" | "editorialRating" | "releaseDate" | "title"} [options.sort] méthode de tri des entités renvoyées
     * @param {GGTypes.Request.Games.Query} [options.query] à renseigner pour affiner la recherche
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 100
     * @returns  {(AsyncGenerator<Game[] | GGTypes.Games.Raw, void, unknown>)}
     */
    static getGames(options?: { paging?: GGTypes.Request.Paging, raw?: boolean, query?: GGTypes.Request.Games.Query, preset?: "all" | "awaited" | "popular" | "best" | "currentBest" | "releases", sort?: "popularity" | "editorialRating" | "releaseDate" | "title", perPage?: number }): AsyncGenerator<Game[] | GGTypes.Games.Raw, void, unknown>;
    /**
     * Renvoie les jeux vidéo situés à une page particulière et satisfaisant aux arguments donnés.
     *
     * @param {({ paging?: GGTypes.Request.Paging, raw?: boolean, query?: GGTypes.Request.Games.Query, preset?: "all" | "awaited" | "popular" | "best" | "currentBest" | "releases", sort?: "popularity" | "editorialRating" | "releaseDate" | "title", perPage?: number })} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link GGTypes.Games.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Game})
     * @param {"all" | "awaited" | "popular" | "best" | "currentBest" | "releases"} [options.preset] ensemble d'entités parmi lequel la recherche est faite (par défaut `"all"`)
     * @param {"popularity" | "editorialRating" | "releaseDate" | "title"} [options.sort] méthode de tri des entités renvoyées
     * @param {GGTypes.Request.Games.Query} [options.query] à renseigner pour affiner la recherche
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 100
     * @returns  {(Promise<Game[] | GGTypes.Games.Raw>)}
     */
    static getGames(options: { page: number, raw?: boolean, query?: GGTypes.Request.Games.Query, preset?: "all" | "awaited" | "popular" | "best" | "currentBest" | "releases", sort?: "popularity" | "editorialRating" | "releaseDate" | "title", perPage?: number }): Promise<Game[] | GGTypes.Games.Raw>;
    static getGames({ preset = "all", sort = "popularity", query = {}, page, paging = {}, raw = false, perPage = DEFAULT_GG_PER_PAGE }: GGTypes.Request.Games.Options = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const filename = getFilenameFromGameSort(sort);
        const route = `games/${preset}/${filename}`;
    
        if (page !== undefined) {
            const offset = (page - 1) * perPage;
            return request(route, { query: { ...query, limit: perPage, offset }, raw })
        }
        return generator(route, paging, { query: { ...query, limit: perPage }, raw })
    }
    
    /**
     * @hidden
     */
    static getNews(options: GGTypes.Request.News.Options & { page: number, raw: true }): Promise<GGTypes.News.Raw>;
    /**
     * @hidden
     */
    static getNews(options: GGTypes.Request.News.Options & { page: number }): Promise<Content[]>;
    /**
     * @hidden
     */
    static getNews(options: GGTypes.Request.News.Options & { raw: true }): AsyncGenerator<GGTypes.News.Raw, void, unknown>;
    /**
     * @hidden
     */
    static getNews(options?: GGTypes.Request.News.Options): AsyncGenerator<Content[], void, unknown>;
    /**
     * Renvoie un générateur asynchrone des news situées aux pages décrites par le paramètre `paging` et satisfaisant aux arguments donnés.
     *
     * @param {{ paging?: GGTypes.Request.Paging, raw?: boolean, query?: GGTypes.Request.News.Query, perPage?: number }} [options]
     * @param {GGTypes.Request.Paging} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link GGTypes.News.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 100
     * @param {GGTypes.Request.News.Query} [options.query] à renseigner pour affiner la recherche
     * @returns {(AsyncGenerator<Content[] | GGTypes.News.Raw, void, unknown>)}
     */
    static getNews(options?: { paging?: GGTypes.Request.Paging, raw?: boolean, query?: GGTypes.Request.News.Query, perPage?: number }): AsyncGenerator<Content[] | GGTypes.News.Raw, void, unknown>;
    /**
     * Renvoie les news situées à une page particulière et satisfaisant aux arguments donnés.
     *
     * @param {{ page: number, raw?: boolean, query?: GGTypes.Request.News.Query, perPage?: number }} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link GGTypes.News.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 100
     * @param {GGTypes.Request.News.Query} [options.query] à renseigner pour affiner la recherche
     * @returns  {(Promise<Content[] | GGTypes.News.Raw>)}
     */
    static getNews(options: { page: number, raw?: boolean, query?: GGTypes.Request.News.Query, perPage?: number }): Promise<Content[] | GGTypes.News.Raw>;
    static getNews({ query = {}, page, paging = {}, raw = false, perPage = DEFAULT_GG_PER_PAGE }: GGTypes.Request.News.Options = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = "news/datePublished.desc";
    
        if (page !== undefined) {
            const offset = (page - 1) * perPage;
            return request(route, { query: { ...query, limit: perPage, offset }, raw, type: "news" })
        }
        return generator(route, paging, { query: { ...query, limit: perPage }, raw, type: "news" })
    }
    
    /**
     * @hidden
     */
    static getReviews(options: GGTypes.Request.Reviews.Options & { page: number, raw: true }): Promise<GGTypes.Reviews.Raw>;
    /**
     * @hidden
     */
    static getReviews(options: GGTypes.Request.Reviews.Options & { page: number }): Promise<Content[]>;
    /**
     * @hidden
     */
    static getReviews(options: GGTypes.Request.Reviews.Options & { raw: true }): AsyncGenerator<GGTypes.Reviews.Raw, void, unknown>;
    /**
     * @hidden
     */
    static getReviews(options?: GGTypes.Request.Reviews.Options): AsyncGenerator<Content[], void, unknown>;
    /**
     * Renvoie un générateur asynchrone des reviews situées aux pages décrites par le paramètre `paging` et satisfaisant aux arguments donnés.
     *
     * @param {({ paging?: GGTypes.Request.Paging, raw?: boolean, sort?: "datePublished" | "editorialRating" | "gameTitle", query?: GGTypes.Request.Reviews.Query, perPage?: number })} [options]
     * @param {GGTypes.Request.Paging} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link GGTypes.Reviews.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content})
     * @param {"datePublished" | "editorialRating" | "gameTitle"} [options.sort] méthode de tri des entités renvoyées
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 100
     * @param {GGTypes.Request.Reviews.Query} [options.query] à renseigner pour affiner la recherche
     * @returns  {(AsyncGenerator<Content[] | GGTypes.Reviews.Raw, void, unknown>)}
     */
    static getReviews(options?: { paging?: GGTypes.Request.Paging, raw?: boolean, sort?: "datePublished" | "editorialRating" | "gameTitle", query?: GGTypes.Request.Reviews.Query, perPage?: number }): AsyncGenerator<Content[] | GGTypes.Reviews.Raw, void, unknown>;
    /**
     * Renvoie les reviews situées à une page particulière et satisfaisant aux arguments donnés.
     *
     * @param {({ page: number, raw?: boolean, sort?: "datePublished" | "editorialRating" | "gameTitle", query?: GGTypes.Request.Reviews.Query, perPage?: number })} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link GGTypes.Reviews.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content})
     * @param {"datePublished" | "editorialRating" | "gameTitle"} [options.sort] méthode de tri des entités renvoyées
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 100
     * @param {GGTypes.Request.Reviews.Query} [options.query] à renseigner pour affiner la recherche
     * @returns  {(Promise<Content[] | GGTypes.Reviews.Raw>)}
     */
    static getReviews(options: { page: number, raw?: boolean, sort?: "datePublished" | "editorialRating" | "gameTitle", query?: GGTypes.Request.Reviews.Query, perPage?: number }): Promise<Content[] | GGTypes.Reviews.Raw>;
    static getReviews({ sort = "datePublished", query = {}, page, paging = {}, raw = false, perPage = DEFAULT_GG_PER_PAGE }: GGTypes.Request.Reviews.Options = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const filename = getFileNameFromReviewSort(sort);
        const route = `reviews/${filename}`;
    
        if (page !== undefined) {
            const offset = (page - 1) * perPage;
            return request(route, { query: { ...query, limit: perPage, offset }, raw, type: "review" })
        }
        return generator(route, paging, { query: { ...query, limit: perPage }, raw, type: "review" })
    }
    
    static getPreviews(options: GGTypes.Request.Previews.Options & { page: number, raw: true }): Promise<GGTypes.Previews.Raw>;
    static getPreviews(options: GGTypes.Request.Previews.Options & { page: number }): Promise<Content[]>;
    static getPreviews(options: GGTypes.Request.Previews.Options & { raw: true }): AsyncGenerator<GGTypes.Previews.Raw, void, unknown>;
    static getPreviews(options?: GGTypes.Request.Previews.Options): AsyncGenerator<Content[], void, unknown>;
    static getPreviews({ query = {}, page, paging = {}, raw = false, perPage = DEFAULT_GG_PER_PAGE }: GGTypes.Request.Previews.Options = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = "previews/datePublished.desc";
    
        if (page !== undefined) {
            const offset = (page - 1) * perPage;
            return request(route, { query: { ...query, limit: perPage, offset }, raw, type: "preview" })
        }
        return generator(route, paging, { query: { ...query, limit: perPage }, raw, type: "review" })
    }
    
    static getVideos(options: GGTypes.Request.Videos.Options & { page: number, raw: true }): Promise<GGTypes.Videos.Raw>;
    static getVideos(options: GGTypes.Request.Videos.Options & { page: number }): Promise<Video[]>;
    static getVideos(options: GGTypes.Request.Videos.Options & { raw: true }): AsyncGenerator<GGTypes.Videos.Raw, void, unknown>;
    static getVideos(options?: GGTypes.Request.Videos.Options): AsyncGenerator<Video[], void, unknown>;
    static getVideos({ query = {}, page, paging = {}, raw = false, perPage = DEFAULT_GG_PER_PAGE }: GGTypes.Request.Previews.Options = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = "videos/datePublished.desc";
    
        if (page !== undefined) {
            const offset = (page - 1) * perPage;
            return request(route, { query: { ...query, limit: perPage, offset }, raw, type: "video" })
        }
        return generator(route, paging, { query: { ...query, limit: perPage }, raw, type: "video" })
    }
    
    static getFolders(options: GGTypes.Request.Folders.Options & { page: number, raw: true }): Promise<GGTypes.Folders.Raw>;
    static getFolders(options: GGTypes.Request.Folders.Options & { page: number }): Promise<Content[]>;
    static getFolders(options: GGTypes.Request.Folders.Options & { raw: true }): AsyncGenerator<GGTypes.Previews.Raw, void, unknown>;
    static getFolders(options?: GGTypes.Request.Folders.Options): AsyncGenerator<Content[], void, unknown>;
    static getFolders({ query = {}, page, paging = {}, raw = false, perPage = DEFAULT_GG_PER_PAGE }: GGTypes.Request.Folders.Options = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = "topics/datePublished.desc";
    
        if (page !== undefined) {
            const offset = (page - 1) * perPage;
            return request(route, { query: { ...query, limit: perPage, offset }, raw, type: "folder" })
        }
        return generator(route, paging, { query: { ...query, limit: perPage }, raw, type: "folder" })
    }
}