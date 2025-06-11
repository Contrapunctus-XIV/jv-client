/**
 * @module classes
 */

import { callApi } from "../requests.js";
import { InexistentContent } from "../errors.js";
import Content, { Video } from "./Content.js";
import Review from "./Review.js";
import { DEFAULT_PER_PAGE, HTTP_CODES } from "../vars.js";
import { checkInteger } from "../utils.js";
import { V4Types } from "../types/index.js";

/**
 * Classe représentant un jeu vidéo. Utilise l'API v4.
 *
 */
export default class Game {
    private _id: number;
    
    /**
     * Crée une nouvelle instance de la classe `Game`.
     * @param {number} id ID du jeu
     */
    constructor(id: number) {
        checkInteger(id);
        this._id = id;
    }

    /**
     * Renvoie l'ID du jeu.
     *
     * @type {number}
     */
    get id(): number {
        return this._id;
    }

    private generator(route: string, paging: V4Types.Request.Paging, options: V4Types.Request.Game.RequestOptions & { raw: true, type: "video" }): AsyncGenerator<V4Types.Videos.Raw, void, unknown>;
    private generator(route: string, paging: V4Types.Request.Paging, options: V4Types.Request.Game.RequestOptions & { raw: true, type: "review" }): AsyncGenerator<V4Types.Game.Reviews.Raw, void, unknown>;
    private generator(route: string, paging: V4Types.Request.Paging, options: V4Types.Request.Game.RequestOptions & { raw: true }): AsyncGenerator<V4Types.Contents.Raw, void, unknown>;
    private generator(route: string, paging: V4Types.Request.Paging, options: V4Types.Request.Game.RequestOptions & { type: "video" }): AsyncGenerator<Video[], void, unknown>;
    private generator(route: string, paging: V4Types.Request.Paging, options: V4Types.Request.Game.RequestOptions & { type: "review" }): AsyncGenerator<Review[], void, unknown>;
    private generator(route: string, paging: V4Types.Request.Paging, options?: V4Types.Request.Game.RequestOptions): AsyncGenerator<Content[], void, unknown>;
    private generator(route: string, paging: V4Types.Request.Paging, { query = {}, raw = false, type = "content", machineId = null }: V4Types.Request.Game.RequestOptions = {}) {
        const self = this;
        
        return (async function* () {
            const { begin = 1, end = null, step = 1 } = paging;
            let current = begin;
    
            while (end ? current <= end : true) {
                try {
                    const data = await self.request(route, { query: { ...query, page: current }, raw, type, machineId }) as any;
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
    
    private request(route: string, options: V4Types.Request.Game.RequestOptions & { raw: true, type: "video" }): Promise<V4Types.Videos.Raw>;
    private request(route: string, options: V4Types.Request.Game.RequestOptions & { raw: true, type: "review" }): Promise<V4Types.Game.Reviews.Raw>;
    private request(route: string, options: V4Types.Request.Game.RequestOptions & { raw: true }): Promise<V4Types.Contents.Raw>;
    private request(route: string, options: V4Types.Request.Game.RequestOptions & { type: "video" }): Promise<Video[]>;
    private request(route: string, options: V4Types.Request.Game.RequestOptions & { type: "review" }): Promise<Review[]>;
    private request(route: string, options?: V4Types.Request.Game.RequestOptions): Promise<Content[]>;
    private request(route: string, { query = {}, raw = false, type = "content", machineId = null }: V4Types.Request.Game.RequestOptions = {}) {
        return callApi(route, { query, allowedStatusErrors: [HTTP_CODES.NOT_FOUND] })
            .then(response => {
                this._rejectIfInexistent(response, machineId);
                return response.json();
            })
            .then(data => {
                switch (type) {
                    case "content":
                        return raw ? data as V4Types.Contents.Raw : data.items.map((c: V4Types.Content.Generic) => new Content(c.id));
                    case "video":
                        return raw ? data as V4Types.Videos.Raw : data.items.map((v: V4Types.Video.Infos) => new Video(v.id));
                    case "review":
                        return raw ? data as V4Types.Game.Reviews.Raw : data.items.map((r: V4Types.Game.Review.Infos) => new Review(r.id, this, machineId!));
                }
            });
    }

    /**
     *
     * @hidden
     * @param {Response} response
     * @param {(number | null)} [machine=null]
     */
    async _rejectIfInexistent(response: Response, machine: number | null = null) {
        if (response.status === HTTP_CODES.NOT_FOUND) {
            if (machine) {
                throw new InexistentContent(`Game of ID ${this._id} does not exist on machine ${machine}.`);
            } else {
                throw new InexistentContent(`Game of ID ${this._id} does not exist.`);
            }
        }
    }

    /**
     * Renvoie `true` si le jeu existe, `false` sinon.
     *
     * @returns  {Promise<boolean>}
     */
    async doesGameExist(): Promise<boolean> {
        const route = `games/${this._id}/any`;

        const response = await callApi(route);
        return response.ok;
    }

    /**
     * Renvoie les informations du jeu vidéo.
     *
     * @param {({ machineId?: number })} [options]
     * @param {number} [options.machineId] à renseigner pour traiter une machine spécifique du jeu, par défaut les données globales du jeu sont renvoyées
     * @throws {@link errors.InexistentContent | InexistentContent} si le jeu n'existe pas ou si la machine spécifiée n'existe pas sur le jeu
     * @returns  {Promise<V4Types.Game.Infos>}
     */
    async getInfos({ machineId }: { machineId?: number } = {}): Promise<V4Types.Game.Infos> {
        const route = machineId ? `games/${this._id}/${machineId}` : `games/${this._id}/any`;
        const response = await callApi(route);

        this._rejectIfInexistent(response, machineId);

        const data = await response.json();

        return data;
    }

    /**
     * Renvoie les informations détaillées du jeu vidéo.
     *
     * @param {({ machineId?: number })} [options]
     * @param {number} [options.machineId] à renseigner pour traiter une machine spécifique du jeu, par défaut les données globales du jeu sont renvoyées
     * @throws {@link errors.InexistentContent | InexistentContent} si le jeu n'existe pas ou si la machine spécifiée n'existe pas sur le jeu
     * @returns  {Promise<V4Types.Game.GameDetails>}
     */
    async getDetails({ machineId }: { machineId?: number } = {}): Promise<V4Types.Game.GameDetails> {
        const route = machineId ? `games/${this._id}/${machineId}/details` : `games/${this._id}/any/details`;
        const response = await callApi(route);

        this._rejectIfInexistent(response, machineId);

        const data = await response.json();
        return data;
    }

    /**
     * Renvoie les informations génériques du jeu vidéo.
     *
     * @param {({ machineId?: number })} [options]
     * @param {number} [options.machineId] à renseigner pour traiter une machine spécifique du jeu, par défaut les données globales du jeu sont renvoyées
     * @throws {@link errors.InexistentContent | InexistentContent} si le jeu n'existe pas ou si la machine spécifiée n'existe pas sur le jeu
     * @returns  {Promise<V4Types.Game.Generic>}
     */
    async getLightInfos({ machineId }: { machineId?: number } = {}): Promise<V4Types.Game.Generic> {
        const route = machineId ? `games/${this._id}/${machineId}/light` : `games/${this._id}/any/light`;
        const response = await callApi(route, { allowedStatusErrors: [HTTP_CODES.NOT_FOUND] });

        this._rejectIfInexistent(response, machineId);

        const data = await response.json() as V4Types.Game.Generic;
        return data;
    }

    /**
     * Renvoie un objet contenant les URL des images associées au jeu.
     *
     * @param {({ machineId?: number })} [options]
     * @param {number} [options.machineId] à renseigner pour traiter une machine spécifique du jeu, par défaut les données globales du jeu sont renvoyées
     * @throws {@link errors.InexistentContent | InexistentContent} si le jeu n'existe pas ou si la machine spécifiée n'existe pas sur le jeu
     * @returns  {Promise<V4Types.Game.Images>}
     */
    async getImages({ machineId }: { machineId?: number } = {}): Promise<V4Types.Game.Images> {
        const route = machineId ? `games/${this._id}/${machineId}/images` : `games/${this._id}/any/images`;
        const response = await callApi(route, { query: { perPage: 100_000 } });

        this._rejectIfInexistent(response, machineId);

        const data = await response.json() as V4Types.Game.Images;

        return data;
    }
    
    /**
     * Renvoie les statistiques concernant les avis du jeu.
     *
     * @throws {@link errors.InexistentContent | InexistentContent} si le jeu n'existe pas
     * @returns  {Promise<V4Types.Game.Reviews.GlobalStats[]>}
     */
    async getReviewsStats(): Promise<V4Types.Game.Reviews.GlobalStats[]> {
        const route = `games/${this._id}/any/reviews`;
        const response = await callApi(route);

        this._rejectIfInexistent(response);

        const data = await response.json();
        return data.items;
    }

    /**
     * @hidden
     */
    getNews(options: V4Types.Request.Game.Options & { page: number, raw: true }): Promise<V4Types.Contents.Raw>;
    /**
     * @hidden
     */
    getNews(options: V4Types.Request.Game.Options & { page: number }): Promise<Content[]>;
    /**
     * @hidden
     */
    getNews(options: V4Types.Request.Game.Options & { raw: true }): AsyncGenerator<V4Types.Contents.Raw, void, unknown>;
    /**
     * @hidden
     */
    getNews(options?: V4Types.Request.Game.Options): AsyncGenerator<Content[], void, unknown>;
    /**
     * Renvoie un générateur asynchrone des actualités associées au jeu situées aux pages décrites par le paramètre `paging`.
     * 
     * @example
     * ```ts
     * const game = new Game(531990);
     * for await (const page of game.getNews()) {
     *      console.log(page);
     * }
     * ```
     * 
     * @param {{ paging?: V4Types.Request.Paging, machineId?: number, raw?: boolean, perPage?: number }} [options]
     * @param {V4Types.Request.Paging} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Contents.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 20
     * @param {number} [options.machineId] à renseigner pour traiter une machine spécifique du jeu, par défaut les données globales du jeu sont renvoyées
     * @throws {@link errors.InexistentContent | InexistentContent} si le jeu n'existe pas ou si la machine spécifiée n'existe pas sur le jeu
     * @returns  {(AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>)}
     */
    getNews(options?: { paging?: V4Types.Request.Paging, machineId?: number, raw?: boolean, perPage?: number }): AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>;
    /**
     * Renvoie les actualités associées au jeu situées à une page particulière.
     * 
     * @example
     * ```ts
     * const game = new Game(531990);
     * console.log(await game.getNews({ page: 2 }));
     * ```
     * 
     * @param {{ page: number, machineId?: number, raw?: boolean, perPage?: number }} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Contents.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 20
     * @param {number} [options.machineId] à renseigner pour traiter une machine spécifique du jeu, par défaut les données globales du jeu sont renvoyées
     * @throws {@link errors.InexistentContent | InexistentContent} si le jeu n'existe pas ou si la machine spécifiée n'existe pas sur le jeu
     * @returns  {(Promise<Content[] | V4Types.Contents.Raw>)}
     */
    getNews(options: { page: number, machineId?: number, raw?: boolean, perPage?: number }): Promise<Content[] | V4Types.Contents.Raw>;
    getNews({ machineId, raw = false, page, paging = {}, perPage = DEFAULT_PER_PAGE }: V4Types.Request.Game.Options = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = machineId ? `games/${this._id}/${machineId}/news` : `games/${this._id}/any/news`;
        
        if (page !== undefined) {
                return this.request(route, { raw, query: { page, perPage }, machineId });
        }
                
        return this.generator(route, paging, { raw, query: { page, perPage }, machineId });
    }

    /**
     * @hidden
     */
    getReviews(machineId: number, options: V4Types.Request.Options & { page: number, raw: true }): Promise<V4Types.Game.Reviews.Raw>;
    /**
     * @hidden
     */
    getReviews(machineId: number, options: V4Types.Request.Options & { page: number }): Promise<Review[]>;
    /**
     * @hidden
     */
    getReviews(machineId: number, options: V4Types.Request.Options & { raw: true }): AsyncGenerator<V4Types.Game.Reviews.Raw, void, unknown>;
    /**
     * @hidden
     */
    getReviews(machineId: number, options?: V4Types.Request.Options): AsyncGenerator<Review[], void, unknown>;
    /**
     * Renvoie un générateur asynchrone des avis sur le jeu, sur la machine spécifiée et situés aux pages décrites par le paramètre `paging`.
     * 
     * @example
     * ```ts
     * const game = new Game(531990);
     * for await (const page of game.getReviews(10)) {
     *      console.log(page);
     * }
     * ```
     * @param {number} machineId l'ID de la machine
     * @param {{ raw?: boolean, paging?: V4Types.Request.Paging, perPage?: number }} [options]
     * @param {V4Types.Request.Paging} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Game.Reviews.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Review})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 20
     * @throws {@link errors.InexistentContent | InexistentContent} si le jeu n'existe pas ou si la machine spécifiée n'existe pas sur le jeu
     * @returns  {(AsyncGenerator<Review[] | V4Types.Game.Reviews.Raw, void, unknown>)}
     */
    getReviews(machineId: number, options?: { paging?: V4Types.Request.Paging, raw?: boolean, perPage?: number }): AsyncGenerator<Review[] | V4Types.Game.Reviews.Raw, void, unknown>;
    /**
     * Renvoie les avis sur le jeu, sur la machine spécifiée et situés à une page particulière.
     * 
     * @example
     * ```ts
     * const game = new Game(531990);
     * console.log(await game.getReviews(10, { page: 2 }));
     * ```
     * @param {number} machineId l'ID de la machine
     * @param {{ raw?: boolean, page: number, perPage?: number }} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Game.Reviews.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Review})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 20
     * @throws {@link errors.InexistentContent | InexistentContent} si le jeu n'existe pas ou si la machine spécifiée n'existe pas sur le jeu
     * @returns  {(Promise<Review[] | V4Types.Game.Reviews.Raw>)}
     */
    getReviews(machineId: number, options: { page: number, raw?: boolean, perPage?: number }): Promise<Review[] | V4Types.Game.Reviews.Raw>;
    getReviews(machineId: number, { raw = false, page, paging = {}, perPage = DEFAULT_PER_PAGE }: V4Types.Request.Options = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = `games/${this._id}/${machineId}/reviews/users`;
        
        if (page !== undefined) {
                return this.request(route, { raw, query: { page, perPage }, machineId, type: "review" });
        }
                
        return this.generator(route, paging, { raw, query: { page, perPage }, machineId, type: "review" });
    }

    /**
     * @hidden
     */
    getVideos(options: V4Types.Request.Game.Options & { page: number, raw: true }): Promise<V4Types.Videos.Raw>;
    /**
     * @hidden
     */
    getVideos(options: V4Types.Request.Game.Options & { page: number }): Promise<Video[]>;
    /**
     * @hidden
     */
    getVideos(options: V4Types.Request.Game.Options & { raw: true }): AsyncGenerator<V4Types.Videos.Raw, void, unknown>;
    /**
     * @hidden
     */
    getVideos(options?: V4Types.Request.Game.Options): AsyncGenerator<Video[], void, unknown>;
    /**
     * Renvoie un générateur asynchrone des vidéos associées au jeu situées aux pages décrites par le paramètre `paging`.
     *
     * @example
     * ```ts
     * const game = new Game(531990);
     * for await (const page of game.getVideos()) {
     *      console.log(page);
     * }
     * ```
     * 
     * @param {{ paging?: V4Types.Request.Paging, machineId?: number, raw?: boolean, perPage?: number }} [options]
     * @param {V4Types.Request.Paging} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Videos.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Video})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 20
     * @param {number} [options.machineId] à renseigner pour traiter une machine spécifique du jeu, par défaut les données globales du jeu sont renvoyées
     * @throws {@link errors.InexistentContent | InexistentContent} si le jeu n'existe pas ou si la machine spécifiée n'existe pas sur le jeu
     * @returns  {(AsyncGenerator<Video[] | V4Types.Videos.Raw, void, unknown>)}
     */
    getVideos(options?: { paging?: V4Types.Request.Paging, machineId?: number, raw?: boolean, perPage?: number }): AsyncGenerator<Video[] | V4Types.Videos.Raw, void, unknown>;
    /**
     * Renvoie les vidéos associées au jeu situées à une page particulière.
     * 
     * @example
     * ```ts
     * const game = new Game(531990);
     * console.log(await game.getVideos({ page: 2 }));
     * ```
     * 
     * @param {{ page: number, machineId?: number, raw?: boolean, perPage?: number }} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Videos.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Video})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 20
     * @param {number} [options.machineId] à renseigner pour traiter une machine spécifique du jeu, par défaut les données globales du jeu sont renvoyées
     * @throws {@link errors.InexistentContent | InexistentContent} si le jeu n'existe pas ou si la machine spécifiée n'existe pas sur le jeu
     * @returns  {(Promise<Video[] | V4Types.Videos.Raw>)}
     */
    getVideos(options: { page: number, machineId?: number, raw?: boolean, perPage?: number }): Promise<Video[] | V4Types.Videos.Raw>;
    getVideos({ machineId, raw = false, page, paging = {}, perPage = DEFAULT_PER_PAGE }: V4Types.Request.Game.Options = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = machineId ? `games/${this._id}/${machineId}/videos` : `games/${this._id}/any/videos`;
        
        if (page !== undefined) {
                return this.request(route, { raw, query: { page, perPage }, machineId, type: "video" });
        }
                
        return this.generator(route, paging, { raw, query: { page, perPage }, machineId, type: "video" });
    }

    /**
     * @hidden
     */
    getWikis(options: V4Types.Request.Game.Options & { page: number, raw: true }): Promise<V4Types.Contents.Raw>;
    /**
     * @hidden
     */
    getWikis(options: V4Types.Request.Game.Options & { page: number }): Promise<Content[]>;
    /**
     * @hidden
     */
    getWikis(options: V4Types.Request.Game.Options & { raw: true }): AsyncGenerator<V4Types.Contents.Raw, void, unknown>;
    /**
     * @hidden
     */
    getWikis(options?: V4Types.Request.Game.Options): AsyncGenerator<Content[], void, unknown>;
    /**
     * Renvoie un générateur asynchrone des wikis associés au jeu situés aux pages décrites par le paramètre `paging`.
     * 
     * @example
     * ```ts
     * const game = new Game(531990);
     * for await (const page of game.getWikis()) {
     *      console.log(page);
     * }
     * ```
     * @param {{ paging?: V4Types.Request.Paging, machineId?: number, raw?: boolean, perPage?: number }} [options]
     * @param {V4Types.Request.Paging} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Contents.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 20
     * @param {number} [options.machineId] à renseigner pour traiter une machine spécifique du jeu, par défaut les données globales du jeu sont renvoyées
     * @throws {@link errors.InexistentContent | InexistentContent} si le jeu n'existe pas ou si la machine spécifiée n'existe pas sur le jeu
     * @returns  {(AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>)}
     */
    getWikis(options?: { paging?: V4Types.Request.Paging, machineId?: number, raw?: boolean, perPage?: number }): AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>;
    /**
     * Renvoie les wikis associés au jeu situés à une page particulière.
     * 
     * @example
     * ```ts
     * const game = new Game(531990);
     * console.log(await game.getWikis({ page: 2 }));
     * ```
     * 
     * @param {{ page: number, machineId?: number, raw?: boolean, perPage?: number }} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Contents.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut 20
     * @param {number} [options.machineId] à renseigner pour traiter une machine spécifique du jeu, par défaut les données globales du jeu sont renvoyées
     * @throws {@link errors.InexistentContent | InexistentContent} si le jeu n'existe pas ou si la machine spécifiée n'existe pas sur le jeu
     * @returns  {(Promise<Content[] | V4Types.Contents.Raw>)}
     */
    getWikis(options: { page: number, machineId?: number, raw?: boolean, perPage?: number }): Promise<Content[] | V4Types.Contents.Raw>;
    getWikis({ machineId, raw = false, page, paging = {}, perPage = DEFAULT_PER_PAGE }: V4Types.Request.Game.Options = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = machineId ? `games/${this._id}/${machineId}/wikis` : `games/${this._id}/any/wikis`;
        
        if (page !== undefined) {
                return this.request(route, { raw, query: { page, perPage }, machineId });
        }
                
        return this.generator(route, paging, { raw, query: { page, perPage }, machineId });
    }
}