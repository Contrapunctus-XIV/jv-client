/**
 * @module classes
 */

import { InexistentContent } from "../errors.js";
import { requestApi } from "../requests.js";
import { checkInteger } from "../utils.js";
import { HTTP_CODES } from "../vars.js";
import Game from "./Game.js";
import { V4Types } from "../types/index.js";
/**
 * Classe représentant un avis utilisateur sur un jeu ({@link Game}).
 *
 */
export default class Review {
    private _id: number;
    private _gameId: number;
    private _machineId: number;

    /**
     * Crée une instance de `Review`.
     * @param {number} id ID de l'avis
     * @param {(number | Game)} game jeu associé
     * @param {number} machineId machine sur laquelle l'avis a été posté
     */
    constructor(id: number, game: number | Game, machineId: number) {
        checkInteger(id);
        this._id = id;
        if (game instanceof Game) {
            this._gameId = game.id;
        } else {
            checkInteger(game);
            this._gameId = game;
        }

        checkInteger(machineId);
        this._machineId = machineId;
    }

    /**
     * Renvoie l'ID de l'avis.
     *
     * @readonly
     * @type {number}
     */
    get id(): number {
        return this._id;
    }

    /**
     * Renvoie l'ID du jeu associé à l'avis.
     *
     * @readonly
     * @type {number}
     */
    get gameId(): number {
        return this._gameId;
    }

    /**
     * Renvoie l'ID de la machine associée à l'avis.
     *
     * @readonly
     * @type {number}
     */
    get machineId(): number {
        return this._machineId;
    }

    /**
     * @hidden
     */
    _rejectIfInexistent(response: Response): void {
        if (response.status === HTTP_CODES.NOT_FOUND) {
            throw new InexistentContent(`Review of ID ${this._id} does not exist.`);
        }
    }

    /**
     * Renvoie `true` si l'avis existe, `false` sinon.
     *
     * @returns  {Promise<boolean>}
     */
    async doesReviewExist(): Promise<boolean> {
        const route = `games/${this._gameId}/${this._machineId}/reviews/users/${this._id}`;
        const response = await requestApi(route);

        return response.ok;
    }

    /**
     * Renvoie les informations de l'avis.
     *
     * @throws {@link errors.InexistentContent | InexistentContent} si l'avis n'existe pas
     * @returns  {Promise<V4Types.Game.Review.Infos>}
     */
    async getInfos(): Promise<V4Types.Game.Review.Infos> {
        const route = `games/${this._gameId}/${this._machineId}/reviews/users/${this._id}`;
        const response = await requestApi(route);

        this._rejectIfInexistent(response);

        const data = await response.json() as V4Types.Game.Review.Infos;

        return data;
    }
}