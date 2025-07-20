/**
 * @module classes
 */

import { requestApi } from "../requests.js";
import { InexistentContent } from "../errors.js";
import ContentComment from "./ContentComment.js";
import { DEFAULT_PER_PAGE, HTTP_CODES } from "../vars.js";
import { checkInteger } from "../utils.js";
import { V4Types } from "../types/index.js";


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

    private generator(route: string, paging: V4Types.Request.Paging, options: V4Types.Request.RequestOptions & { raw: true, type: "video" }): AsyncGenerator<V4Types.Videos.Raw, void, unknown>;
    private generator(route: string, paging: V4Types.Request.Paging, options: V4Types.Request.RequestOptions & { raw: true, type: "comment" }): AsyncGenerator<V4Types.Content.Comments.Raw, void, unknown>;
    private generator(route: string, paging: V4Types.Request.Paging, options: V4Types.Request.RequestOptions & { raw: true, type: "topComment" }): AsyncGenerator<V4Types.Content.Comments.RawTop, void, unknown>;
    private generator(route: string, paging: V4Types.Request.Paging, options: V4Types.Request.RequestOptions & { raw: true }): AsyncGenerator<V4Types.Contents.Raw, void, unknown>;
    private generator(route: string, paging: V4Types.Request.Paging, options: V4Types.Request.RequestOptions & { type: "video" }): AsyncGenerator<Video[], void, unknown>;
    private generator(route: string, paging: V4Types.Request.Paging, options: V4Types.Request.RequestOptions & { type: "comment" }): AsyncGenerator<ContentComment[], void, unknown>;
    private generator(route: string, paging: V4Types.Request.Paging, options: V4Types.Request.RequestOptions & { type: "topComment" }): AsyncGenerator<ContentComment[], void, unknown>;
    private generator(route: string, paging: V4Types.Request.Paging, options?: V4Types.Request.RequestOptions): AsyncGenerator<Content[], void, unknown>;
    private generator(route: string, paging: V4Types.Request.Paging, { query = {}, raw = false, type = "content" }: V4Types.Request.RequestOptions = {}) {
        const self = this;
        const perPage = query.perPage ? query.perPage : DEFAULT_PER_PAGE;
        let itemsLength = perPage;

        return (async function* () {
            const { begin = 1, end = null, step = 1 } = paging;
            let current = begin;

            while ((end ? current <= end : true) && itemsLength >= perPage) { // modif de la condition pour le cas topComments
                try {
                    const data = await self.request(route, { query: { ...query, page: current }, raw, type }) as any;
                    if (raw && (!data || !data.items || data.items.length === 0)) break;
                    else if (data.length === 0) break;
                    itemsLength = raw ? data.items.length : data.length;
                    yield data;

                } catch (e: any) {
                    break;
                }

                current += step;
            }
        })();
    }

    private request(route: string, options: V4Types.Request.RequestOptions & { raw: true, type: "video" }): Promise<V4Types.Videos.Raw>;
    private request(route: string, options: V4Types.Request.RequestOptions & { raw: true, type: "comment" }): Promise<V4Types.Content.Comments.Raw>;
    private request(route: string, options: V4Types.Request.RequestOptions & { raw: true, type: "topComment" }): Promise<V4Types.Content.Comments.RawTop>;
    private request(route: string, options: V4Types.Request.RequestOptions & { raw: true }): Promise<V4Types.Contents.Raw>;
    private request(route: string, options: V4Types.Request.RequestOptions & { type: "video" }): Promise<Video[]>;
    private request(route: string, options: V4Types.Request.RequestOptions & { type: "comment" }): Promise<ContentComment[]>;
    private request(route: string, options: V4Types.Request.RequestOptions & { type: "topComment" }): Promise<ContentComment[]>;
    private request(route: string, options?: V4Types.Request.RequestOptions): Promise<Content[]>;
    private request(route: string, { query = {}, raw = false, type = "content" }: V4Types.Request.RequestOptions = {}) {
        return requestApi(route, { query, allowedStatusErrors: [HTTP_CODES.NOT_FOUND] })
            .then(response => {
                this._rejectIfInexistent(response);
                return response.json();
            })
            .then(data => {
                switch (type) {
                    case "content":
                        return raw ? data as V4Types.Contents.Raw : data.items.map((c: V4Types.Content.Generic) => new Content(c.id));
                    case "video":
                        return raw ? data as V4Types.Videos.Raw : data.items.map((v: V4Types.Video.Infos) => new Video(v.id));
                    case "comment":
                    case "topComment":
                        return raw ? data as V4Types.Content.Comments.Raw : (data as V4Types.Content.Comments.Raw).items.map((c: V4Types.Content.Comment.Infos) => new ContentComment(c.id, this));
                }
            });
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
    async _rejectIfInexistent(response: Response) {
        if (response.status === HTTP_CODES.NOT_FOUND) {
            throw new InexistentContent(`Content of ID ${this._id} does not exist.`);
        }
    }

    /**
     * Renvoie les informations du contenu.
     * 
     * @throws {@link errors.InexistentContent | InexistentContent} si le contenu n'existe pas
     * @returns {Promise<V4Types.Content.Infos>}
     */
    async getInfos(): Promise<V4Types.Content.Infos> {
        const route = `contents/${this._id}`;
        const response = await requestApi(route);

        this._rejectIfInexistent(response);

        const data = await response.json();

        return data;
    }

    /**
     * @hidden
     */
    getComments(options: V4Types.Request.Options & { page: number, raw: true }): Promise<V4Types.Content.Comments.Raw>;
    /**
     * @hidden
     */
    getComments(options: V4Types.Request.Options & { page: number }): Promise<ContentComment[]>;
    /**
     * @hidden
     */
    getComments(options: V4Types.Request.Options & { raw: true }): AsyncGenerator<V4Types.Content.Comments.Raw, void, unknown>;
    /**
     * @hidden
     */
    getComments(options?: V4Types.Request.Options): AsyncGenerator<ContentComment[], void, unknown>;
    /**
     * Renvoie un générateur asynchrone des commentaires du contenu situés aux pages décrites par le paramètre `paging`.
     *
     * @param {{ raw?: boolean, paging?: V4Types.Request.Paging, perPage?: number }} [options]
     * @param {V4Types.Request.Paging} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Content.Comments.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link ContentComment})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @example
     * ```ts
     * const content = new Content(1);
     * for await (const page of content.getComments()) {
     *      console.log(page);
     * }
     * ```
     * @throws {@link errors.InexistentContent | InexistentContent} si le contenu n'existe pas
     * @returns  {(AsyncGenerator<ContentComment[] | V4Types.Content.Comments.Raw, void, unknown>)}
     */
    getComments(options?: { raw?: boolean, paging?: V4Types.Request.Paging, perPage?: number }): AsyncGenerator<ContentComment[] | V4Types.Content.Comments.Raw, void, unknown>;
    /**
     * Renvoie les commentaires du contenu situés à une page particulière.
     *
     * @param {{ page: number, raw?: boolean, perPage?: number }} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Content.Comments.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link ContentComment})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @example
     * ```ts
     * const content = new Content(1);
     * console.log(await content.getComments({ page: 2 }));
     * ```
     * @throws {@link errors.InexistentContent | InexistentContent} si le contenu n'existe pas
     * @returns  {(AsyncGenerator<ContentComment[] | V4Types.Content.Comments.Raw, void, unknown>)}
     */
    getComments(options: { raw?: boolean, page: number, perPage?: number }): AsyncGenerator<ContentComment[] | V4Types.Content.Comments.Raw, void, unknown>;
    getComments({ raw = false, page, paging = {}, perPage = DEFAULT_PER_PAGE }: V4Types.Request.Options = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = `contents/${this._id}/comments`;

        if (page !== undefined) {
            return this.request(route, { raw, query: { page, perPage }, type: "comment" });
        }

        return this.generator(route, paging, { raw, query: { page, perPage }, type: "comment" });
    }

    private getTopComments(options: V4Types.Request.Options & { page: number, raw: true }): Promise<V4Types.Content.Comments.RawTop>;
    private getTopComments(options: V4Types.Request.Options & { page: number }): Promise<ContentComment[]>;
    private getTopComments(options: V4Types.Request.Options & { raw: true }): AsyncGenerator<V4Types.Content.Comments.RawTop, void, unknown>;
    private getTopComments(options?: V4Types.Request.Options): AsyncGenerator<ContentComment[], void, unknown>;
    private getTopComments({ raw = false, page, paging = {}, perPage = DEFAULT_PER_PAGE }: V4Types.Request.Options = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = `contents/${this._id}/comments/tops`;

        if (page !== undefined) {
            return this.request(route, { raw, query: { page, perPage }, type: "topComment" });
        }

        return this.generator(route, paging, { raw, query: { page, perPage }, type: "topComment" });
    }

    /**
     * @hidden
     */
    getRelatedNews(options: V4Types.Request.Options & { page: number, raw: true }): Promise<V4Types.Contents.Raw>;
    /**
     * @hidden
     */
    getRelatedNews(options: V4Types.Request.Options & { page: number }): Promise<Content[]>;
    /**
     * @hidden
     */
    getRelatedNews(options: V4Types.Request.Options & { raw: true }): AsyncGenerator<V4Types.Contents.Raw, void, unknown>;
    /**
     * @hidden
     */
    getRelatedNews(options?: V4Types.Request.Options): AsyncGenerator<Content[], void, unknown>;
    /**
     * Renvoie un générateur asynchrone des actualités associées au contenu situées aux pages décrites par le paramètre `paging`.
     *
     * @param {{ raw?: boolean, paging?: V4Types.Request.Paging, perPage?: number }} [options]
     * @param {V4Types.Request.Paging} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Contents.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @example
     * ```ts
     * const content = new Content(1);
     * for await (const page of content.getRelatedNews()) {
     *      console.log(page);
     * }
     * ```
     * @throws {@link errors.InexistentContent | InexistentContent} si le contenu n'existe pas
     * @returns  {(AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>)}
     */
    getRelatedNews(options?: { raw?: boolean, paging?: V4Types.Request.Paging, perPage?: number }): AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>;
    /**
     * Renvoie les actualités associées au contenu situées à une page particulière.
     *
     * @param {{ page: number, raw?: boolean, perPage?: number }} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Contents.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @example
     * ```ts
     * const content = new Content(1);
     * console.log(await content.getRelatedNews({ page: 2 }));
     * ```
     * @throws {@link errors.InexistentContent | InexistentContent} si le contenu n'existe pas
     * @returns  {(AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>)}
     */
    getRelatedNews(options: { raw?: boolean, page: number, perPage?: number }): Promise<Content[] | V4Types.Contents.Raw>;
    getRelatedNews({ raw = false, page, paging = {}, perPage = DEFAULT_PER_PAGE }: V4Types.Request.Options = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = `contents/${this._id}/news`;

        if (page !== undefined) {
            return this.request(route, { raw, query: { page, perPage } });
        }

        return this.generator(route, paging, { raw, query: { page, perPage } });
    }

    /**
     * @hidden
     */
    getRelatedVideos(options: V4Types.Request.Options & { page: number, raw: true }): Promise<V4Types.Videos.Raw>;
    /**
     * @hidden
     */
    getRelatedVideos(options: V4Types.Request.Options & { page: number }): Promise<Video[]>;
    /**
     * @hidden
     */
    getRelatedVideos(options: V4Types.Request.Options & { raw: true }): AsyncGenerator<V4Types.Videos.Raw, void, unknown>;
    /**
     * @hidden
     */
    getRelatedVideos(options?: V4Types.Request.Options): AsyncGenerator<Video[], void, unknown>;
    /**
     * Renvoie un générateur asynchrone des vidéos associées au contenu situées aux pages décrites par le paramètre `paging`.
     *
     * @param {{ raw?: boolean, paging?: V4Types.Request.Paging, perPage?: number }} [options]
     * @param {V4Types.Request.Paging} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Videos.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Video})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @example
     * ```ts
     * const content = new Content(1);
     * for await (const page of content.getRelatedVideos()) {
     *      console.log(page);
     * }
     * ```
     * @throws {@link errors.InexistentContent | InexistentContent} si le contenu n'existe pas
     * @returns  {(AsyncGenerator<Video[] | V4Types.Videos.Raw, void, unknown>)}
     */
    getRelatedVideos(options?: { raw?: boolean, paging?: V4Types.Request.Paging, perPage?: number }): AsyncGenerator<Video[] | V4Types.Videos.Raw, void, unknown>;
    /**
     * Renvoie les vidéos associées au contenu situées à une page particulière.
     *
     * @param {{ page: number, raw?: boolean, perPage?: number }} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Videos.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Video})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @example
     * ```ts
     * const content = new Content(1);
     * console.log(await content.getRelatedVideos({ page: 2 }));
     * ```
     * @throws {@link errors.InexistentContent | InexistentContent} si le contenu n'existe pas
     * @returns  {(AsyncGenerator<Video[] | V4Types.Videos.Raw, void, unknown>)}
     */
    getRelatedVideos(options: { page: number, raw?: boolean, perPage?: number }): Promise<Video[] | V4Types.Videos.Raw>;
    getRelatedVideos({ raw = false, page, paging = {}, perPage = DEFAULT_PER_PAGE }: V4Types.Request.Options = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = `contents/${this._id}/videos`;

        if (page !== undefined) {
            return this.request(route, { raw, query: { page, perPage }, type: "video" });
        }

        return this.generator(route, paging, { raw, query: { page, perPage }, type: "video" });
    }

    /**
     * @hidden
     */
    getRelatedWikis(options: V4Types.Request.Options & { page: number, raw: true }): Promise<V4Types.Contents.Raw>;
    /**
     * @hidden
     */
    getRelatedWikis(options: V4Types.Request.Options & { page: number }): Promise<Content[]>;
    /**
     * @hidden
     */
    getRelatedWikis(options: V4Types.Request.Options & { raw: true }): AsyncGenerator<V4Types.Contents.Raw, void, unknown>;
    /**
     * @hidden
     */
    getRelatedWikis(options?: V4Types.Request.Options): AsyncGenerator<Content[], void, unknown>;
    /**
     * Renvoie un générateur asynchrone des wikis associés au contenu situés aux pages décrites par le paramètre `paging`.
     *
     * @param {{ raw?: boolean, paging?: V4Types.Request.Paging, perPage?: number }} [options]
     * @param {V4Types.Request.Paging} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw]  `true` pour renvoyer un objet JSON brut ({@link V4Types.Contents.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @example
     * ```ts
     * const content = new Content(1);
     * for await (const page of content.getRelatedWikis()) {
     *      console.log(page);
     * }
     * ```
     * @throws {@link errors.InexistentContent | InexistentContent} si le contenu n'existe pas
     * @returns  {(AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>)}
     */
    getRelatedWikis(options?: { raw?: boolean, paging?: V4Types.Request.Paging, perPage?: number }): AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>;
    /**
     * Renvoie les wikis associés au contenu situés à une page particulière.
     *
     * @param {{ page: number, raw?: boolean, perPage?: number }} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw]  `true` pour renvoyer un objet JSON brut ({@link V4Types.Contents.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @example
     * ```ts
     * const content = new Content(1);
     * console.log(await content.getRelatedWikis({ page: 2 }));
     * ```
     * @throws {@link errors.InexistentContent | InexistentContent} si le contenu n'existe pas
     * @returns  {(AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>)}
     */
    getRelatedWikis(options: { page: number, raw?: boolean, perPage?: number }): Promise<Content[] | V4Types.Contents.Raw>;
    getRelatedWikis({ raw = false, page, paging = {}, perPage = DEFAULT_PER_PAGE }: V4Types.Request.Options = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
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
     * @throws {@link errors.InexistentContent | InexistentContent} si la vidéo n'existe pas
     * @returns {Promise<V4Types.Video.Infos>}
     */
    async getInfos(): Promise<V4Types.Video.Infos> {
        const route = `videos/${this._id}`;
        const response = await requestApi(route);

        this._rejectIfInexistent(response);

        const data = await response.json() as V4Types.Video.Infos;

        return data;
    }
}