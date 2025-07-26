/**
 * @module classes
 */

import { requestApi } from "../requests.js";
import { NonexistentContent } from "../errors.js";
import ContentComment from "./ContentComment.js";
import { DEFAULT_PER_PAGE, HTTP_CODES } from "../vars.js";
import { checkInteger } from "../utils.js";
import { LibTypes, V4Types } from "../types/index.js";


/**
 * Classe représentant un contenu JVC (news, review, preview, etc.). Utilise l'API `v4`.
 * 
 */
export default class Content {
    protected _id: number;

    /**
     * Crée une instance de la classe `Content`.
     * @param {number} id ID du contenu
     */
    constructor(id: number) {
        checkInteger(id);
        this._id = id;
    }

    /**
     * Renvoie l'ID du contenu.
     * 
     * @returns {number}
     */
    get id(): number {
        return this._id;
    }

    private generator(route: string, paging: LibTypes.Args.Pagination, options: LibTypes.Args.Raw<LibTypes.Args.Content.RequestOptions<"video">>): AsyncGenerator<V4Types.Videos.Raw, void, unknown>;
    private generator(route: string, paging: LibTypes.Args.Pagination, options: LibTypes.Args.Raw<LibTypes.Args.Content.RequestOptions<"comment">>): AsyncGenerator<V4Types.Content.Comments.Raw, void, unknown>;
    private generator(route: string, paging: LibTypes.Args.Pagination, options: LibTypes.Args.Raw<LibTypes.Args.Content.RequestOptions<"topComment">>): AsyncGenerator<V4Types.Content.Comments.RawTop, void, unknown>;
    private generator(route: string, paging: LibTypes.Args.Pagination, options: LibTypes.Args.Raw<LibTypes.Args.Content.RequestOptions>): AsyncGenerator<V4Types.Contents.Raw, void, unknown>;
    private generator(route: string, paging: LibTypes.Args.Pagination, options: LibTypes.Args.NotRaw<LibTypes.Args.Content.RequestOptions<"video">>): AsyncGenerator<Video[], void, unknown>;
    private generator(route: string, paging: LibTypes.Args.Pagination, options: LibTypes.Args.NotRaw<LibTypes.Args.Content.RequestOptions<"comment">>): AsyncGenerator<ContentComment[], void, unknown>;
    private generator(route: string, paging: LibTypes.Args.Pagination, options: LibTypes.Args.NotRaw<LibTypes.Args.Content.RequestOptions<"topComment">>): AsyncGenerator<ContentComment[], void, unknown>;
    private generator(route: string, paging: LibTypes.Args.Pagination, options?: LibTypes.Args.NotRaw<LibTypes.Args.Content.RequestOptions>): AsyncGenerator<Content[], void, unknown>;
    private generator(route: string, paging: LibTypes.Args.Pagination, { query = {}, raw = false, type = "content" }: LibTypes.Args.NotRaw<LibTypes.Args.Content.RequestOptions> = {}) {
        const self = this;
        const perPage = query.perPage ? query.perPage : DEFAULT_PER_PAGE;
        let itemsLength = perPage;

        return (async function* () {
            const { begin = 1, end = null, step = 1 } = paging;
            let current = begin;
            
            while ((end ? current <= end : true) && itemsLength >= perPage) { // modif de la condition pour le cas topComments
                const data = await self.request(route, { query: { ...query, page: current }, raw, type }) as any;
                if (raw && (!data || !data.items || data.items.length === 0)) break;
                else if (data.length === 0) break;
                itemsLength = raw ? data.items.length : data.length;
                yield data;

                current += step;
            }
        })();
    }

    private request(route: string, options: LibTypes.Args.Raw<LibTypes.Args.Content.RequestOptions<"video">>): Promise<V4Types.Videos.Raw>;
    private request(route: string, options: LibTypes.Args.Raw<LibTypes.Args.Content.RequestOptions<"comment">>): Promise<V4Types.Content.Comments.Raw>;
    private request(route: string, options: LibTypes.Args.Raw<LibTypes.Args.Content.RequestOptions<"topComment">>): Promise<V4Types.Content.Comments.RawTop>;
    private request(route: string, options: LibTypes.Args.Raw<LibTypes.Args.Content.RequestOptions>): Promise<V4Types.Contents.Raw>;
    private request(route: string, options: LibTypes.Args.NotRaw<LibTypes.Args.Content.RequestOptions<"video">>): Promise<Video[]>;
    private request(route: string, options: LibTypes.Args.NotRaw<LibTypes.Args.Content.RequestOptions<"comment">>): Promise<ContentComment[]>;
    private request(route: string, options: LibTypes.Args.NotRaw<LibTypes.Args.Content.RequestOptions<"topComment">>): Promise<ContentComment[]>;
    private request(route: string, options?: LibTypes.Args.NotRaw<LibTypes.Args.Content.RequestOptions>): Promise<Content[]>;
    private async request(route: string, { query = {}, raw = false, type = "content" }: LibTypes.Args.NotRaw<LibTypes.Args.Content.RequestOptions> = {}) {
        const response = await requestApi(route, { query, allowedStatusErrors: [HTTP_CODES.NOT_FOUND] });

        this._rejectIfNonexistent(response);
        const data = await response.json();
        switch (type) {
            case "content":
                return raw ? data as V4Types.Contents.Raw : data.items.map((c: V4Types.Content.Generic) => new Content(c.id));
            case "video":
                return raw ? data as V4Types.Videos.Raw : data.items.map((v: V4Types.Video.Infos) => new Video(v.id));
            case "comment":
            case "topComment":
                return raw ? data as V4Types.Content.Comments.Raw : (data as V4Types.Content.Comments.Raw).items.map((c_1: V4Types.Content.Comment.Infos) => new ContentComment(c_1.id, this));
        }
    }

    /**
     * Renvoie `true` si le contenu existe, `false` sinon.
     * 
     * @returns {Promise<boolean>}
     */
    async doesContentExist(): Promise<boolean> {
        // fonctionne sur contenu supprimé ?
        const route = `contents/${this._id}`;

        const response = await requestApi(route);
        return response.ok;
    }

    /**
     * 
     * @param {Response} response
     * @returns {Promise<void>}
     * @hidden
     */
    _rejectIfNonexistent(response: Response) {
        if (response.status === HTTP_CODES.NOT_FOUND) {
            throw new NonexistentContent(`Content of ID ${this._id} does not exist.`);
        }
    }

    /**
     * Renvoie les informations du contenu.
     * 
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le contenu n'existe pas
     * @returns {Promise<V4Types.Content.Infos>}
     */
    async getInfos(): Promise<V4Types.Content.Infos> {
        const route = `contents/${this._id}`;
        const response = await requestApi(route);

        this._rejectIfNonexistent(response);

        const data = await response.json();
        return data;
    }

    /**
     * @hidden
     */
    getComments(options: LibTypes.Args.RawAndPage<LibTypes.Args.Content.Base>): Promise<V4Types.Content.Comments.Raw>;
    /**
     * @hidden
     */
    getComments(options: LibTypes.Args.Page<LibTypes.Args.Content.Base>): Promise<ContentComment[]>;
    /**
     * @hidden
     */
    getComments(options: LibTypes.Args.RawAndPaging<LibTypes.Args.Content.Base>): AsyncGenerator<V4Types.Content.Comments.Raw, void, unknown>;
    /**
     * @hidden
     */
    getComments(options?: LibTypes.Args.Paging<LibTypes.Args.Content.Base>): AsyncGenerator<ContentComment[], void, unknown>;
    /**
     * Renvoie un générateur asynchrone des commentaires du contenu situés aux pages décrites par le paramètre `paging`.
     *
     * @param {LibTypes.Args.Paging<LibTypes.Args.Content.Base>} [options]
     * @param {LibTypes.Args.Pagination} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Content.Comments.Raw | `V4Types.Content.Comments.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link ContentComment | `ContentComment`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @example
     * ```ts
     * const content = new Content(1);
     * for await (const page of content.getComments()) {
     *      console.log(page);
     * }
     * ```
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le contenu n'existe pas
     * @returns  {(AsyncGenerator<ContentComment[] | V4Types.Content.Comments.Raw, void, unknown>)}
     */
    getComments(options?: LibTypes.Args.Paging<LibTypes.Args.Content.Base>): AsyncGenerator<ContentComment[] | V4Types.Content.Comments.Raw, void, unknown>;
    /**
     * Renvoie les commentaires du contenu situés à une page particulière.
     *
     * @param {LibTypes.Args.Page<LibTypes.Args.Content.Base>} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Content.Comments.Raw | `V4Types.Content.Comments.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link ContentComment | `ContentComment`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @example
     * ```ts
     * const content = new Content(1);
     * console.log(await content.getComments({ page: 2 }));
     * ```
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le contenu n'existe pas
     * @returns  {(AsyncGenerator<ContentComment[] | V4Types.Content.Comments.Raw, void, unknown>)}
     */
    getComments(options: LibTypes.Args.Page<LibTypes.Args.Content.Base>): AsyncGenerator<ContentComment[] | V4Types.Content.Comments.Raw, void, unknown>;
    getComments({ raw = false, page, paging = {}, perPage = DEFAULT_PER_PAGE }: LibTypes.Args.PageOrPaging<LibTypes.Args.Content.Base> = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = `contents/${this._id}/comments`;

        if (page !== undefined) {
            return this.request(route, { raw, query: { page, perPage }, type: "comment" });
        }

        return this.generator(route, paging, { raw, query: { page, perPage }, type: "comment" });
    }

    private getTopComments(options: LibTypes.Args.RawAndPage<LibTypes.Args.Base>): Promise<V4Types.Content.Comments.RawTop>;
    private getTopComments(options: LibTypes.Args.Page<LibTypes.Args.Base>): Promise<ContentComment[]>;
    private getTopComments(options: LibTypes.Args.RawAndPaging<LibTypes.Args.Base>): AsyncGenerator<V4Types.Content.Comments.RawTop, void, unknown>;
    private getTopComments(options?: LibTypes.Args.Paging<LibTypes.Args.Base>): AsyncGenerator<ContentComment[], void, unknown>;
    private getTopComments({ raw = false, page, paging = {}, perPage = DEFAULT_PER_PAGE }: LibTypes.Args.PageOrPaging<LibTypes.Args.Base> = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = `contents/${this._id}/comments/tops`;

        if (page !== undefined) {
            return this.request(route, { raw, query: { page, perPage }, type: "topComment" });
        }

        return this.generator(route, paging, { raw, query: { page, perPage }, type: "topComment" });
    }

    /**
     * @hidden
     */
    getRelatedNews(options: LibTypes.Args.RawAndPage<LibTypes.Args.Content.Base>): Promise<V4Types.Contents.Raw>;
    /**
     * @hidden
     */
    getRelatedNews(options: LibTypes.Args.Page<LibTypes.Args.Content.Base>): Promise<Content[]>;
    /**
     * @hidden
     */
    getRelatedNews(options: LibTypes.Args.RawAndPaging<LibTypes.Args.Content.Base>): AsyncGenerator<V4Types.Contents.Raw, void, unknown>;
    /**
     * @hidden
     */
    getRelatedNews(options?: LibTypes.Args.Paging<LibTypes.Args.Content.Base>): AsyncGenerator<Content[], void, unknown>;
    /**
     * Renvoie un générateur asynchrone des actualités associées au contenu situées aux pages décrites par le paramètre `paging`.
     *
     * @param {LibTypes.Args.Paging<LibTypes.Args.Content.Base>} [options]
     * @param {LibTypes.Args.Pagination} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Contents.Raw | `V4Types.Contents.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content | `Content`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @example
     * ```ts
     * const content = new Content(1);
     * for await (const page of content.getRelatedNews()) {
     *      console.log(page);
     * }
     * ```
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le contenu n'existe pas
     * @returns  {(AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>)}
     */
    getRelatedNews(options?: LibTypes.Args.Paging<LibTypes.Args.Content.Base>): AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>;
    /**
     * Renvoie les actualités associées au contenu situées à une page particulière.
     *
     * @param {LibTypes.Args.Page<LibTypes.Args.Content.Base>} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Contents.Raw | `V4Types.Contents.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content | `Content`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @example
     * ```ts
     * const content = new Content(1);
     * console.log(await content.getRelatedNews({ page: 2 }));
     * ```
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le contenu n'existe pas
     * @returns  {(AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>)}
     */
    getRelatedNews(options: LibTypes.Args.Page<LibTypes.Args.Content.Base>): Promise<Content[] | V4Types.Contents.Raw>;
    getRelatedNews({ raw = false, page, paging = {}, perPage = DEFAULT_PER_PAGE }: LibTypes.Args.PageOrPaging<LibTypes.Args.Content.Base> = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = `contents/${this._id}/news`;

        if (page !== undefined) {
            return this.request(route, { raw, query: { page, perPage } });
        }

        return this.generator(route, paging, { raw, query: { page, perPage } });
    }

    /**
     * @hidden
     */
    getRelatedVideos(options: LibTypes.Args.RawAndPage<LibTypes.Args.Content.Base>): Promise<V4Types.Videos.Raw>;
    /**
     * @hidden
     */
    getRelatedVideos(options: LibTypes.Args.Page<LibTypes.Args.Content.Base>): Promise<Video[]>;
    /**
     * @hidden
     */
    getRelatedVideos(options: LibTypes.Args.RawAndPaging<LibTypes.Args.Content.Base>): AsyncGenerator<V4Types.Videos.Raw, void, unknown>;
    /**
     * @hidden
     */
    getRelatedVideos(options?: LibTypes.Args.Paging<LibTypes.Args.Content.Base>): AsyncGenerator<Video[], void, unknown>;
    /**
     * Renvoie un générateur asynchrone des vidéos associées au contenu situées aux pages décrites par le paramètre `paging`.
     *
     * @param {LibTypes.Args.Paging<LibTypes.Args.Content.Base>} [options]
     * @param {LibTypes.Args.Pagination} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Videos.Raw | `V4Types.Videos.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Video | `Video`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @example
     * ```ts
     * const content = new Content(1);
     * for await (const page of content.getRelatedVideos()) {
     *      console.log(page);
     * }
     * ```
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le contenu n'existe pas
     * @returns  {(AsyncGenerator<Video[] | V4Types.Videos.Raw, void, unknown>)}
     */
    getRelatedVideos(options?: LibTypes.Args.Paging<LibTypes.Args.Content.Base>): AsyncGenerator<Video[] | V4Types.Videos.Raw, void, unknown>;
    /**
     * Renvoie les vidéos associées au contenu situées à une page particulière.
     *
     * @param {LibTypes.Args.Page<LibTypes.Args.Content.Base>} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Videos.Raw | `V4Types.Videos.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Video | `Video`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @example
     * ```ts
     * const content = new Content(1);
     * console.log(await content.getRelatedVideos({ page: 2 }));
     * ```
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le contenu n'existe pas
     * @returns  {(AsyncGenerator<Video[] | V4Types.Videos.Raw, void, unknown>)}
     */
    getRelatedVideos(options: LibTypes.Args.Page<LibTypes.Args.Content.Base>): Promise<Video[] | V4Types.Videos.Raw>;
    getRelatedVideos({ raw = false, page, paging = {}, perPage = DEFAULT_PER_PAGE }: LibTypes.Args.PageOrPaging<LibTypes.Args.Content.Base> = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = `contents/${this._id}/videos`;

        if (page !== undefined) {
            return this.request(route, { raw, query: { page, perPage }, type: "video" });
        }

        return this.generator(route, paging, { raw, query: { page, perPage }, type: "video" });
    }

    /**
     * @hidden
     */
    getRelatedWikis(options: LibTypes.Args.RawAndPage<LibTypes.Args.Content.Base>): Promise<V4Types.Contents.Raw>;
    /**
     * @hidden
     */
    getRelatedWikis(options: LibTypes.Args.Page<LibTypes.Args.Content.Base>): Promise<Content[]>;
    /**
     * @hidden
     */
    getRelatedWikis(options: LibTypes.Args.RawAndPaging<LibTypes.Args.Content.Base>): AsyncGenerator<V4Types.Contents.Raw, void, unknown>;
    /**
     * @hidden
     */
    getRelatedWikis(options?: LibTypes.Args.Paging<LibTypes.Args.Content.Base>): AsyncGenerator<Content[], void, unknown>;
    /**
     * Renvoie un générateur asynchrone des wikis associés au contenu situés aux pages décrites par le paramètre `paging`.
     *
     * @param {LibTypes.Args.Paging<LibTypes.Args.Content.Base>} [options]
     * @param {LibTypes.Args.Pagination} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw]  `true` pour renvoyer un objet JSON brut ({@link V4Types.Contents.Raw | `V4Types.Contents.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content | `Content`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @example
     * ```ts
     * const content = new Content(1);
     * for await (const page of content.getRelatedWikis()) {
     *      console.log(page);
     * }
     * ```
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le contenu n'existe pas
     * @returns  {(AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>)}
     */
    getRelatedWikis(options?: LibTypes.Args.Paging<LibTypes.Args.Content.Base>): AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>;
    /**
     * Renvoie les wikis associés au contenu situés à une page particulière.
     *
     * @param {LibTypes.Args.Page<LibTypes.Args.Content.Base>} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw]  `true` pour renvoyer un objet JSON brut ({@link V4Types.Contents.Raw | `V4Types.Contents.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content | `Content`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @example
     * ```ts
     * const content = new Content(1);
     * console.log(await content.getRelatedWikis({ page: 2 }));
     * ```
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le contenu n'existe pas
     * @returns  {(AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>)}
     */
    getRelatedWikis(options: LibTypes.Args.Page<LibTypes.Args.Content.Base>): Promise<Content[] | V4Types.Contents.Raw>;
    getRelatedWikis({ raw = false, page, paging = {}, perPage = DEFAULT_PER_PAGE }: LibTypes.Args.PageOrPaging<LibTypes.Args.Content.Base> = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = `contents/${this._id}/wikis`;

        if (page !== undefined) {
            return this.request(route, { raw, query: { page, perPage } });
        }

        return this.generator(route, paging, { raw, query: { page, perPage } });
    }
}

/**
 * Classe qui hérite de Content et représente un contenu de type vidéo. Utilise l'API `v4`.
 * 
 * @class
 * @extends Content
 */
export class Video extends Content {
    /**
     * Crée une instance de la classe `Video`.
     * @param id ID de la vidéo
     */
    constructor(id: number) {
        super(id);
    }

    /**
     * Renvoie `true` si la vidéo existe, `false` sinon.
     * 
     * @returns {Promise<boolean>}
     */
    async doesContentExist(): Promise<boolean> {
        const route = `videos/${this._id}`;

        const response = await requestApi(route);
        return response.ok;
    }

    /**
     * Renvoie les infos de la vidéo.
     * 
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si la vidéo n'existe pas
     * @returns {Promise<V4Types.Video.Infos>}
     */
    async getInfos(): Promise<V4Types.Video.Infos> {
        const route = `videos/${this._id}`;
        const response = await requestApi(route);

        this._rejectIfNonexistent(response);

        const data = await response.json() as V4Types.Video.Infos;

        return data;
    }
}