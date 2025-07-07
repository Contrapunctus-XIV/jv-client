/**
 * @module classes
 */

import { callApi } from '../requests.js';
import { InexistentContent } from "../errors.js";
import Game from "./Game.js";
import Forum from "./Forum.js";
import Topic from "./Topic.js";
import Client from './Client.js';
import Review from './Review.js';
import Content from './Content.js';
import Alias from './Alias.js';
import { checkInteger } from '../utils.js';
import { HTTP_CODES } from '../vars.js';
import { V4Types } from '../types/index.js';

/**
 * Une classe Account qui représente un compte dont l'ID est donnée en entrée. Utilise l'API `v4` à la différence de {@link Alias} qui utilise le site JVC.
 * 
 */
export default class Account {
    private _id: number;

    /**
     * Crée une instance de la classe `Account`.
     * @param {number} id ID du compte
     */
    constructor(id: number) {
        checkInteger(id);
        this._id = id;
    }

    /**
     * Renvoie l'ID du compte.
     *
     * @returns {number}
     */
    get id(): number {
        return this._id;
    }

    /**
     * 
     * @hidden
     * @private
     * @param {Response} response
     * @returns {void}
     */
    private _rejectIfInexistent(response: Response): void {
        if (response.status === HTTP_CODES.NOT_FOUND) {
            throw new InexistentContent(`Account of ID ${this._id} does not exist.`);
        }
    }

    /**
     * Renvoie un booléen à `true` si le compte existe, `false` sinon.
     * 
     * @returns {Promise<boolean>}
     */
    async doesAccountExist(): Promise<boolean> {
        const route = `accounts/${this._id}/profile`;
        const response = await callApi(route);

        return response.ok;
    }

    /**
     * Renvoie un objet contenant diverses informations sur le compte.
     * 
     * @throws {@link errors.InexistentContent | InexistentContent} si le compte n'existe pas.
     * @returns {Promise<V4Types.Account.Infos>}
     */
    async getInfos(): Promise<V4Types.Account.Infos> {
        const route = `accounts/${this._id}/profile`;
        const response = await callApi(route);

        this._rejectIfInexistent(response);

        const data = await response.json() as V4Types.Account.Infos;
        return data;
    }

    /**
     * @hidden
     */
    getPage(options: { raw: true }): Promise<V4Types.Account.Page.Raw>;
    /**
     * @hidden
     */
    getPage(options?: { raw?: boolean }): Promise<V4Types.Account.Page.Default>;
    /** Renvoie les reviews et contenus associés au compte, extraits depuis sa page publique.
     *
     * @param {{ raw?: boolean }} [options]
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Account.Page.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link V4Types.Account.Page.Default})
     * @throws {@link errors.InexistentContent | InexistentContent} si le compte n'existe pas. 
     * @returns  {(Promise<V4Types.Account.Page.Default | V4Types.Account.Page.Raw>)}
     */
    getPage(options?: { raw?: boolean }): Promise<V4Types.Account.Page.Default | V4Types.Account.Page.Raw>;
    async getPage({ raw = false } = {}): Promise<V4Types.Account.Page.Default | V4Types.Account.Page.Raw> {
        const route = `accounts/${this._id}/page`;
        const response = await callApi(route);

        this._rejectIfInexistent(response);

        const data = await response.json() as V4Types.Account.Page.Raw;
        return raw ? data : {
            reviews: data.reviews.items.map((r: V4Types.Game.Review.FullInfos) => new Review(r.reviewId, r.id, r.machines[0])),
            contents: data.contents.items.map((c: V4Types.Content.Generic) => new Content(c.id))
        };
    }

    /**
     * @hidden
     */
    getFavorites(options: { raw: true }): Promise<V4Types.Account.Favorites.Raw>;
    /**
     * @hidden
     */
    getFavorites(options?: { raw?: boolean }): Promise<V4Types.Account.Favorites.Default>;
    /**
     * Renvoie les forums, topics et jeux favoris du compte.
     *
     * @param {{ raw?: boolean }} [options]
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Account.Favorites.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link V4Types.Account.Favorites.Default})
     * @throws {@link errors.InexistentContent | InexistentContent} si le compte n'existe pas.
     * @returns  {(Promise<V4Types.Account.Favorites.Default | V4Types.Account.Favorites.Raw>)}
     */
    getFavorites(options?: { raw?: boolean }): Promise<V4Types.Account.Favorites.Default | V4Types.Account.Favorites.Raw>;
    async getFavorites({ raw = false } = {}): Promise<V4Types.Account.Favorites.Default | V4Types.Account.Favorites.Raw> {
        const route = `accounts/${this._id}/favorites`;
        const response = await callApi(route);

        this._rejectIfInexistent(response);

        const data = await response.json() as V4Types.Account.Favorites.Raw;

        return raw ? data : {
            games: data.games.items.map((game: any) => new Game(game.id)),
            forums: data.forums.items.map((forum: any) => new Forum(forum.id)),
            topics: data.topics.items.map((topic: any) => new Topic(topic.id))
        }
    }

    /**
     * peu d'utilité
     * @private
     * @param {Client} client
     * @throws {@link errors.InexistentContent | InexistentContent} si le compte n'existe pas.
     * @returns {Promise<V4Types.Account.Reports>}
     */
    private async getCurrentReport(client: Client): Promise<V4Types.Account.Reports> {
        const route = `accounts/${this._id}/report`;
        const response = await callApi(route, { cookies: client.session });

        this._rejectIfInexistent(response);

        const data = await response.json() as V4Types.Account.Reports;

        return data;
    }

    /**
     * Renvoie un booléen à `true` si le compte est banni, `false` sinon.
     * 
     * @throws {@link errors.InexistentContent | InexistentContent} si le compte n'existe pas.
     * @returns {Promise<boolean>}
     */
    async isBanned(): Promise<boolean> {
        const alias = (await this.getInfos()).alias;
        const a = new Alias(alias);

        return a.isBanned();
    }
}