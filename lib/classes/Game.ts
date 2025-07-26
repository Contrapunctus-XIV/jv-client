/**
 * @module classes
 */

import { requestApi } from "../requests.js";
import { NonexistentContent } from "../errors.js";
import Content, { Video } from "./Content.js";
import Review from "./Review.js";
import { DEFAULT_PER_PAGE, HTTP_CODES, MAXIMUM_PER_PAGE } from "../vars.js";
import { checkInteger } from "../utils.js";
import { LibTypes, V4Types } from "../types/index.js";

/**
 * Classe représentant un jeu vidéo. Utilise l'API `v4`.
 *
 */
export default class Game {
    private _id: number;
    private _machineId: number | undefined;
    
    /**
     * Crée une nouvelle instance de la classe `Game`.
     * 
     * Attention, si le paramètre optionnel `machineId` est spécifié, cet ID sera considéré comme la valeur par défaut du paramètre optionnel `machineId` de toutes les méthodes de la classe, au lieu de `undefined`.
     * @param {number} id ID du jeu
     * @param {V4Types.Game.MachineId} [options]
     * @param {number} [options.machineId] ID de la machine auquel se rapporte spécifiquement le jeu (optionnel)
     */
    constructor(id: number, { machineId = undefined }: V4Types.Game.MachineId = {}) {
        checkInteger(id);
        this._id = id;
        this._machineId = machineId;
    }

    /**
     * Renvoie l'ID du jeu.
     *
     * @type {number}
     */
    get id(): number {
        return this._id;
    }

    /**
     * Renvoie l'ID de la machine associée au jeu.
     */
    get machineId(): number | undefined {
        return this._machineId;
    }

    private generator(route: string, paging: LibTypes.Args.Pagination, options: LibTypes.Args.Raw<LibTypes.Args.Game.RequestOptions<"video">>): AsyncGenerator<V4Types.Videos.Raw, void, unknown>;
    private generator(route: string, paging: LibTypes.Args.Pagination, options: LibTypes.Args.Raw<LibTypes.Args.Game.RequestOptions<"review">>): AsyncGenerator<V4Types.Game.Reviews.Raw, void, unknown>;
    private generator(route: string, paging: LibTypes.Args.Pagination, options: LibTypes.Args.Raw<LibTypes.Args.Game.RequestOptions<"content">>): AsyncGenerator<V4Types.Contents.Raw, void, unknown>;
    private generator(route: string, paging: LibTypes.Args.Pagination, options: LibTypes.Args.NotRaw<LibTypes.Args.Game.RequestOptions<"video">>): AsyncGenerator<Video[], void, unknown>;
    private generator(route: string, paging: LibTypes.Args.Pagination, options: LibTypes.Args.NotRaw<LibTypes.Args.Game.RequestOptions<"review">>): AsyncGenerator<Review[], void, unknown>;
    private generator(route: string, paging: LibTypes.Args.Pagination, options?: LibTypes.Args.NotRaw<LibTypes.Args.Game.RequestOptions<"content">>): AsyncGenerator<Content[], void, unknown>;
    private generator(route: string, paging: LibTypes.Args.Pagination, { query = {}, raw = false, type = "content", machineId = undefined }: LibTypes.Args.NotRaw<LibTypes.Args.Game.RequestOptions> = {}) {
        const self = this;
        
        return (async function* () {
            const { begin = 1, end = null, step = 1 } = paging;
            let current = begin;
    
            while (end ? current <= end : true) {
                const data = await self.request(route, { query: { ...query, page: current }, raw, type, machineId }) as any;
                if (raw && (!data || !data.items || data.items.length === 0)) break;
                else if (data.length === 0) break;
                
                yield data;
    
                current += step;
            }
        })();
    }
    
    private request(route: string, options: LibTypes.Args.Raw<LibTypes.Args.Game.RequestOptions<"video">>): Promise<V4Types.Videos.Raw>;
    private request(route: string, options: LibTypes.Args.Raw<LibTypes.Args.Game.RequestOptions<"review">>): Promise<V4Types.Game.Reviews.Raw>;
    private request(route: string, options: LibTypes.Args.Raw<LibTypes.Args.Game.RequestOptions>): Promise<V4Types.Contents.Raw>;
    private request(route: string, options: LibTypes.Args.NotRaw<LibTypes.Args.Game.RequestOptions<"video">>): Promise<Video[]>;
    private request(route: string, options: LibTypes.Args.NotRaw<LibTypes.Args.Game.RequestOptions<"review">>): Promise<Review[]>;
    private request(route: string, options?: LibTypes.Args.NotRaw<LibTypes.Args.Game.RequestOptions>): Promise<Content[]>;
    private async request(route: string, { query = {}, raw = false, type = "content", machineId = undefined }: LibTypes.Args.NotRaw<LibTypes.Args.Game.RequestOptions> = {}) {
        const response = await requestApi(route, { query, allowedStatusErrors: [HTTP_CODES.NOT_FOUND] });
        this._rejectIfNonexistent(response, machineId);
        const data = await response.json();
        switch (type) {
            case "content":
                return raw ? data as V4Types.Contents.Raw : data.items.map((c: V4Types.Content.Generic) => new Content(c.id));
            case "video":
                return raw ? data as V4Types.Videos.Raw : data.items.map((v: V4Types.Video.Infos) => new Video(v.id));
            case "review":
                return raw ? data as V4Types.Game.Reviews.Raw : data.items.map((r: V4Types.Game.Review.Infos) => new Review(r.id, this, machineId!));
        }
    }

    /**
     *
     * @hidden
     * @param {Response} response
     * @param {(number | null)} [machine=null]
     */
    _rejectIfNonexistent(response: Response, machine: number | undefined = undefined) {
        if (response.status === HTTP_CODES.NOT_FOUND) {
            if (machine) {
                throw new NonexistentContent(`Game of ID ${this._id} does not exist on machine ${machine}.`);
            } else {
                throw new NonexistentContent(`Game of ID ${this._id} does not exist.`);
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

        const response = await requestApi(route);
        return response.ok;
    }

    /**
     * Renvoie les informations du jeu vidéo.
     *
     * @param {LibTypes.Args.Game.MachineId} [options]
     * @param {number} [options.machineId] à renseigner pour traiter une machine spécifique du jeu, par défaut les données globales du jeu sont renvoyées
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le jeu n'existe pas ou si la machine spécifiée n'existe pas sur le jeu
     * @returns  {Promise<V4Types.Game.Infos>}
     */
    async getInfos({ machineId }: LibTypes.Args.Game.MachineId = {}): Promise<V4Types.Game.Infos> {
        const route = machineId ? `games/${this._id}/${machineId}` : this._machineId ? `games/${this._id}/${this._machineId}` : `games/${this._id}/any`;
        const response = await requestApi(route);
        this._rejectIfNonexistent(response, machineId);

        const data = await response.json();

        return data;
    }

    /**
     * Renvoie les informations détaillées du jeu vidéo.
     *
     * @param {LibTypes.Args.Game.MachineId} [options]
     * @param {number} [options.machineId] à renseigner pour traiter une machine spécifique du jeu, par défaut les données globales du jeu sont renvoyées
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le jeu n'existe pas ou si la machine spécifiée n'existe pas sur le jeu
     * @returns  {Promise<V4Types.Game.GameDetails>}
     */
    async getDetails({ machineId }: LibTypes.Args.Game.MachineId = {}): Promise<V4Types.Game.GameDetails> {
        const route = machineId ? `games/${this._id}/${machineId}/details` : this._machineId ? `games/${this._id}/${this._machineId}/details` : `games/${this._id}/any/details`;
        const response = await requestApi(route);

        this._rejectIfNonexistent(response, machineId);

        const data = await response.json();
        return data;
    }

    /**
     * Renvoie les informations génériques du jeu vidéo.
     *
     * @param {LibTypes.Args.Game.MachineId} [options]
     * @param {number} [options.machineId] à renseigner pour traiter une machine spécifique du jeu, par défaut les données globales du jeu sont renvoyées
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le jeu n'existe pas ou si la machine spécifiée n'existe pas sur le jeu
     * @returns  {Promise<V4Types.Game.Generic>}
     */
    async getLightInfos({ machineId }: LibTypes.Args.Game.MachineId = {}): Promise<V4Types.Game.Generic> {
        const route = machineId ? `games/${this._id}/${machineId}/light` : this._machineId ? `games/${this._id}/${this._machineId}/light` : `games/${this._id}/any/light`;
        const response = await requestApi(route, { allowedStatusErrors: [HTTP_CODES.NOT_FOUND] });

        this._rejectIfNonexistent(response, machineId);

        const data = await response.json() as V4Types.Game.Generic;
        return data;
    }

    /**
     * Renvoie un objet contenant les URL des images associées au jeu.
     *
     * @param {LibTypes.Args.Game.MachineId} [options]
     * @param {number} [options.machineId] à renseigner pour traiter une machine spécifique du jeu, par défaut les données globales du jeu sont renvoyées
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le jeu n'existe pas ou si la machine spécifiée n'existe pas sur le jeu
     * @returns  {Promise<V4Types.Game.Images>}
     */
    async getImages({ machineId }: LibTypes.Args.Game.MachineId = {}): Promise<V4Types.Game.Images> {
        const route = machineId ? `games/${this._id}/${machineId}/images` : this._machineId ? `games/${this._id}/${this._machineId}/images` : `games/${this._id}/any/images`;
        const response = await requestApi(route, { query: { perPage: MAXIMUM_PER_PAGE } });

        this._rejectIfNonexistent(response, machineId);

        const data = await response.json() as V4Types.Game.Images;

        return data;
    }
    
    /**
     * Renvoie les statistiques concernant les avis du jeu.
     *
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le jeu n'existe pas
     * @returns  {Promise<V4Types.Game.Reviews.GlobalStats[]>}
     */
    async getReviewsStats(): Promise<V4Types.Game.Reviews.GlobalStats[]> {
        const route = `games/${this._id}/any/reviews`;
        const response = await requestApi(route);

        this._rejectIfNonexistent(response);

        const data = await response.json();
        return data.items;
    }

    /**
     * @hidden
     */
    getNews(options: LibTypes.Args.RawAndPage<LibTypes.Args.Game.Base>): Promise<V4Types.Contents.Raw>;
    /**
     * @hidden
     */
    getNews(options: LibTypes.Args.Page<LibTypes.Args.Game.Base>): Promise<Content[]>;
    /**
     * @hidden
     */
    getNews(options: LibTypes.Args.RawAndPaging<LibTypes.Args.Game.Base>): AsyncGenerator<V4Types.Contents.Raw, void, unknown>;
    /**
     * @hidden
     */
    getNews(options?: LibTypes.Args.Paging<LibTypes.Args.Game.Base>): AsyncGenerator<Content[], void, unknown>;
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
     * @param {LibTypes.Args.Paging<LibTypes.Args.Game.Base>} [options]
     * @param {LibTypes.Args.Pagination} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Contents.Raw | `V4Types.Contents.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content | `Content`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @param {number} [options.machineId] à renseigner pour traiter une machine spécifique du jeu, par défaut les données globales du jeu sont renvoyées
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le jeu n'existe pas ou si la machine spécifiée n'existe pas sur le jeu
     * @returns  {(AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>)}
     */
    getNews(options?: LibTypes.Args.Paging<LibTypes.Args.Game.Base>): AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>;
    /**
     * Renvoie les actualités associées au jeu situées à une page particulière.
     * 
     * @example
     * ```ts
     * const game = new Game(531990);
     * console.log(await game.getNews({ page: 2 }));
     * ```
     * 
     * @param {LibTypes.Args.Page<LibTypes.Args.Game.Base>} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Contents.Raw | `V4Types.Contents.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content | `Content`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @param {number} [options.machineId] à renseigner pour traiter une machine spécifique du jeu, par défaut les données globales du jeu sont renvoyées
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le jeu n'existe pas ou si la machine spécifiée n'existe pas sur le jeu
     * @returns  {(Promise<Content[] | V4Types.Contents.Raw>)}
     */
    getNews(options: LibTypes.Args.Page<LibTypes.Args.Game.Base>): Promise<Content[] | V4Types.Contents.Raw>;
    getNews({ machineId, raw = false, page, paging = {}, perPage = DEFAULT_PER_PAGE }: LibTypes.Args.PageOrPaging<LibTypes.Args.Game.Base> = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = machineId ? `games/${this._id}/${machineId}/news` : this._machineId ? `games/${this._id}/${this._machineId}/news` : `games/${this._id}/any/news`;
        
        if (page !== undefined) {
                return this.request(route, { raw, query: { page, perPage }, machineId });
        }
                
        return this.generator(route, paging, { raw, query: { page, perPage }, machineId });
    }

    /**
     * @hidden
     */
    getReviews(machineId: number, options: LibTypes.Args.RawAndPage<LibTypes.Args.Base>): Promise<V4Types.Game.Reviews.Raw>;
    /**
     * @hidden
     */
    getReviews(machineId: number, options: LibTypes.Args.Page<LibTypes.Args.Base>): Promise<Review[]>;
    /**
     * @hidden
     */
    getReviews(machineId: number, options: LibTypes.Args.RawAndPaging<LibTypes.Args.Base>): AsyncGenerator<V4Types.Game.Reviews.Raw, void, unknown>;
    /**
     * @hidden
     */
    getReviews(machineId: number, options?: LibTypes.Args.Paging<LibTypes.Args.Base>): AsyncGenerator<Review[], void, unknown>;
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
     * @param {LibTypes.Args.Paging<LibTypes.Args.Base>} [options]
     * @param {LibTypes.Args.Pagination} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Game.Reviews.Raw | `V4Types.Game.Reviews.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Review | `Review`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le jeu n'existe pas ou si la machine spécifiée n'existe pas sur le jeu
     * @returns  {(AsyncGenerator<Review[] | V4Types.Game.Reviews.Raw, void, unknown>)}
     */
    getReviews(machineId: number, options?: LibTypes.Args.Paging<LibTypes.Args.Base>): AsyncGenerator<Review[] | V4Types.Game.Reviews.Raw, void, unknown>;
    /**
     * Renvoie les avis sur le jeu, sur la machine spécifiée et situés à une page particulière.
     * 
     * @example
     * ```ts
     * const game = new Game(531990);
     * console.log(await game.getReviews(10, { page: 2 }));
     * ```
     * @param {number} machineId l'ID de la machine
     * @param {LibTypes.Args.Page<LibTypes.Args.Base>} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Game.Reviews.Raw | `V4Types.Game.Reviews.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Review | `Review`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le jeu n'existe pas ou si la machine spécifiée n'existe pas sur le jeu
     * @returns  {(Promise<Review[] | V4Types.Game.Reviews.Raw>)}
     */
    getReviews(machineId: number, options: LibTypes.Args.Page<LibTypes.Args.Base>): Promise<Review[] | V4Types.Game.Reviews.Raw>;
    getReviews(machineId: number, { raw = false, page, paging = {}, perPage = DEFAULT_PER_PAGE }: LibTypes.Args.PageOrPaging<LibTypes.Args.Base> = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = `games/${this._id}/${machineId}/reviews/users`;
        
        if (page !== undefined) {
                return this.request(route, { raw, query: { page, perPage }, machineId, type: "review" });
        }
                
        return this.generator(route, paging, { raw, query: { page, perPage }, machineId, type: "review" });
    }

    /**
     * @hidden
     */
    getVideos(options: LibTypes.Args.RawAndPage<LibTypes.Args.Game.Base>): Promise<V4Types.Videos.Raw>;
    /**
     * @hidden
     */
    getVideos(options: LibTypes.Args.Page<LibTypes.Args.Game.Base>): Promise<Video[]>;
    /**
     * @hidden
     */
    getVideos(options: LibTypes.Args.RawAndPaging<LibTypes.Args.Game.Base>): AsyncGenerator<V4Types.Videos.Raw, void, unknown>;
    /**
     * @hidden
     */
    getVideos(options?: LibTypes.Args.Paging<LibTypes.Args.Game.Base>): AsyncGenerator<Video[], void, unknown>;
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
     * @param {LibTypes.Args.Paging<LibTypes.Args.Game.Base>} [options]
     * @param {LibTypes.Args.Pagination} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Videos.Raw | `V4Types.Videos.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Video | `Video`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @param {number} [options.machineId] à renseigner pour traiter une machine spécifique du jeu, par défaut les données globales du jeu sont renvoyées
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le jeu n'existe pas ou si la machine spécifiée n'existe pas sur le jeu
     * @returns  {(AsyncGenerator<Video[] | V4Types.Videos.Raw, void, unknown>)}
     */
    getVideos(options?: LibTypes.Args.Paging<LibTypes.Args.Game.Base>): AsyncGenerator<Video[] | V4Types.Videos.Raw, void, unknown>;
    /**
     * Renvoie les vidéos associées au jeu situées à une page particulière.
     * 
     * @example
     * ```ts
     * const game = new Game(531990);
     * console.log(await game.getVideos({ page: 2 }));
     * ```
     * 
     * @param {LibTypes.Args.Page<LibTypes.Args.Game.Base>} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Videos.Raw | `V4Types.Videos.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Video | `Video`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @param {number} [options.machineId] à renseigner pour traiter une machine spécifique du jeu, par défaut les données globales du jeu sont renvoyées
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le jeu n'existe pas ou si la machine spécifiée n'existe pas sur le jeu
     * @returns  {(Promise<Video[] | V4Types.Videos.Raw>)}
     */
    getVideos(options: LibTypes.Args.Page<LibTypes.Args.Game.Base>): Promise<Video[] | V4Types.Videos.Raw>;
    getVideos({ machineId, raw = false, page, paging = {}, perPage = DEFAULT_PER_PAGE }: LibTypes.Args.PageOrPaging<LibTypes.Args.Game.Base> = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = machineId ? `games/${this._id}/${machineId}/videos` : this._machineId ? `games/${this._id}/${this._machineId}/videos` : `games/${this._id}/any/videos`;
        
        if (page !== undefined) {
                return this.request(route, { raw, query: { page, perPage }, machineId, type: "video" });
        }
                
        return this.generator(route, paging, { raw, query: { page, perPage }, machineId, type: "video" });
    }

    /**
     * @hidden
     */
    getWikis(options: LibTypes.Args.RawAndPage<LibTypes.Args.Game.Base>): Promise<V4Types.Contents.Raw>;
    /**
     * @hidden
     */
    getWikis(options: LibTypes.Args.Page<LibTypes.Args.Game.Base>): Promise<Content[]>;
    /**
     * @hidden
     */
    getWikis(options: LibTypes.Args.RawAndPaging<LibTypes.Args.Game.Base>): AsyncGenerator<V4Types.Contents.Raw, void, unknown>;
    /**
     * @hidden
     */
    getWikis(options?: LibTypes.Args.Paging<LibTypes.Args.Game.Base>): AsyncGenerator<Content[], void, unknown>;
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
     * @param {LibTypes.Args.Paging<LibTypes.Args.Game.Base>} [options]
     * @param {LibTypes.Args.Pagination} [options.paging] objet décrivant les pages à traiter (par défaut vide : toutes les pages le sont)
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Contents.Raw | `V4Types.Contents.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content | `Content`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @param {number} [options.machineId] à renseigner pour traiter une machine spécifique du jeu, par défaut les données globales du jeu sont renvoyées
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le jeu n'existe pas ou si la machine spécifiée n'existe pas sur le jeu
     * @returns  {(AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>)}
     */
    getWikis(options?: LibTypes.Args.Paging<LibTypes.Args.Game.Base>): AsyncGenerator<Content[] | V4Types.Contents.Raw, void, unknown>;
    /**
     * Renvoie les wikis associés au jeu situés à une page particulière.
     * 
     * @example
     * ```ts
     * const game = new Game(531990);
     * console.log(await game.getWikis({ page: 2 }));
     * ```
     * 
     * @param {LibTypes.Args.Page<LibTypes.Args.Game.Base>} options
     * @param {number} options.page numéro de la page à traiter
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Contents.Raw | `V4Types.Contents.Raw`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Content | `Content`})
     * @param {number} [options.perPage] nombre d'entités par page, par défaut `20`
     * @param {number} [options.machineId] à renseigner pour traiter une machine spécifique du jeu, par défaut les données globales du jeu sont renvoyées
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le jeu n'existe pas ou si la machine spécifiée n'existe pas sur le jeu
     * @returns  {(Promise<Content[] | V4Types.Contents.Raw>)}
     */
    getWikis(options: LibTypes.Args.Page<LibTypes.Args.Game.Base>): Promise<Content[] | V4Types.Contents.Raw>;
    getWikis({ machineId, raw = false, page, paging = {}, perPage = DEFAULT_PER_PAGE }: LibTypes.Args.PageOrPaging<LibTypes.Args.Game.Base> = {}): Promise<any> | AsyncGenerator<any, void, unknown> {
        const route = machineId ? `games/${this._id}/${machineId}/wikis` : this._machineId ? `games/${this._id}/${this._machineId}/wikis` : `games/${this._id}/any/wikis`;
        
        if (page !== undefined) {
                return this.request(route, { raw, query: { page, perPage }, machineId });
        }
                
        return this.generator(route, paging, { raw, query: { page, perPage }, machineId });
    }
}