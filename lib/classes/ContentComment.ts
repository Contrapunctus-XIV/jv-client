/**
 * @module classes
 */

import { InexistentContent } from "../errors.js";
import { callApi } from "../requests.js";
import { checkInteger } from "../utils.js";
import { HTTP_CODES } from "../vars.js";
import Content from "./Content.js";
import { V4Types } from "../types/index.js";

/**
 * Classe représentant un commentaire d'un utilisateur JVC posté sous un contenu (objet {@link Content}). Utilise l'API `v4`.
 *
 */
export default class ContentComment {
    protected _id: number;
    protected _contentId: number;

    /**
     * Crée une instance de la classe `ContentComment`.
     * @param {number} id ID du commentaire
     * @param {(number | Content)} content ID du contenu parent ou objet {@link Content}
     */
    constructor(id: number, content: number | Content) {
        checkInteger(id);

        this._id = id;
        if (content instanceof Content) {
            this._contentId = content.id;
        } else {
            checkInteger(content)
            this._contentId = content;
        }
    }

    /**
     * Renvoie l'ID du commentaire.
     * 
     * @returns {number}
     */
    get id(): number {
        return this._id;
    }

    /**
     * Renvoie l'ID du contenu parent du commentaire.
     * 
     * @returns {number}
     */
    get contentId(): number {
        return this._contentId;
    }

    /**
     * 
     * @param {Response} response
     * @returns {void}
     * @hidden
     */
    _rejectIfInexistent(response: Response) {
        if (response.status === HTTP_CODES.NOT_FOUND) {
            throw new InexistentContent(`Comment of ID ${this._id} (content ${this._contentId}) does not exist.`);
        }
    }

    /**
     * Renvoie un booléen à `true` si le commentaire existe, `false` sinon.
     * 
     * @returns {Promise<boolean>}
     */
    async doesCommentExist(): Promise<boolean> {
        const route = `contents/${this._contentId}/comments/${this._id}`;
        const response = await callApi(route);

        try {
            const data = await response.json();
            if (data.message && data.message.includes("existe")) {
                return false;
            }
            return response.ok && data.state !== "deleted"; //  traitement particulier pour les commentaires. Ils sont toujours dans la base de données même lorsque supprimés.
        } catch (error: any) {
            return false;
        }
    }

    /**
     * Renvoie les informations du commentaire.
     * 
     * @throws {@link errors.InexistentContent | InexistentContent} si le commentaire n'existe pas
     * @returns {Promise<V4Types.Content.Comment.Infos>}
     */
    async getInfos(): Promise<V4Types.Content.Comment.Infos> {
        const route = `contents/${this._contentId}/comments/${this._id}`;

        const response = await callApi(route);
        this._rejectIfInexistent(response);
        const data = await response.json() as V4Types.Content.Comment.Infos;

        return data;
    }

    /**
     * @hidden
     */
    getAnswers(options: { raw: true }): Promise<V4Types.Content.Comment.RawAnswers>;
    /**
     * @hidden
     */
    getAnswers(options?: { raw?: boolean }): Promise<ContentComment[]>;
    /**
     * Renvoie les réponses postées sous le commentaire.
     *
     * @param {{ raw?: boolean }} [options]
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Content.Comment.RawAnswers}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link ContentComment})
     * @returns  {(Promise<ContentComment[] | V4Types.Content.Comment.RawAnswers>)}
     */
    getAnswers(options?: { raw?: boolean }): Promise<ContentComment[] | V4Types.Content.Comment.RawAnswers>;
    async getAnswers({ raw = false }: { raw?: boolean } = {}): Promise<ContentComment[] | V4Types.Content.Comment.RawAnswers> {
        const route = `contents/${this._contentId}/comments/${this._id}/answers`;
        
        const response = await callApi(route);
        this._rejectIfInexistent(response);
        const data = await response.json() as V4Types.Content.Comment.RawAnswers;

        return raw ? data : data.items.map((a: V4Types.Content.Comment.Infos) => new ContentComment(a.id, this._contentId));
    }
}