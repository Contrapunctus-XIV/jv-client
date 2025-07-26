/**
 * @module classes
 */

import { NonexistentContent } from "../errors.js";
import { request, requestApi } from "../requests.js";
import { checkInteger, decodeAllJvCare } from "../utils.js";
import { COMMENT_URL, HTTP_CODES } from "../vars.js";
import Content from "./Content.js";
import { LibTypes, V4Types } from "../types/index.js";
import { load } from "cheerio";

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
     * @param {(number | Content)} content ID du contenu parent ou objet {@link Content | `Content`}
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
    _rejectIfNonexistent(response: Response) {
        if (response.status === HTTP_CODES.NOT_FOUND) {
            throw new NonexistentContent(`Comment of ID ${this._id} (content ${this._contentId}) does not exist.`);
        }
    }

    /**
     * Renvoie un booléen à `true` si le commentaire existe, `false` sinon.
     * 
     * @returns {Promise<boolean>}
     */
    async doesCommentExist(): Promise<boolean> {
        const route = `contents/${this._contentId}/comments/${this._id}`;
        const response = await requestApi(route);

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
     * @throws {@link errors.NonexistentContent | `NonexistentContent`} si le commentaire n'existe pas
     * @returns {Promise<V4Types.Content.Comment.Infos>}
     */
    async getInfos(): Promise<V4Types.Content.Comment.Infos> {
        const route = `contents/${this._contentId}/comments/${this._id}`;

        const response = await requestApi(route);
        this._rejectIfNonexistent(response);
        const data = await response.json() as V4Types.Content.Comment.Infos;

        return data;
    }

    /**
     * @hidden
     */
    getAnswers(options: LibTypes.Args.Raw): Promise<V4Types.Content.Comment.RawAnswers>;
    /**
     * @hidden
     */
    getAnswers(options?: LibTypes.Args.NotRaw): Promise<ContentComment[]>;
    /**
     * Renvoie les réponses postées sous le commentaire.
     *
     * @param {LibTypes.Args.NotRaw} [options]
     * @param {boolean} [options.raw] `true` pour renvoyer des objets JSON brut ({@link V4Types.Content.Comment.RawAnswers | `V4Types.Content.Comment.RawAnswers`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link ContentComment | `ContentComment`})
     * @returns  {(Promise<ContentComment[] | V4Types.Content.Comment.RawAnswers>)}
     */
    getAnswers(options?: LibTypes.Args.NotRaw): Promise<ContentComment[] | V4Types.Content.Comment.RawAnswers>;
    async getAnswers({ raw = false }: LibTypes.Args.NotRaw = {}): Promise<ContentComment[] | V4Types.Content.Comment.RawAnswers> {
        // pas d'erreur si le contenu n'existe pas
        const route = `contents/${this._contentId}/comments/${this._id}/answers`;
        
        const response = await requestApi(route);
        this._rejectIfNonexistent(response);
        const data = await response.json() as V4Types.Content.Comment.RawAnswers;

        return raw ? data : data.items.map((a: V4Types.Content.Comment.Infos) => new ContentComment(a.id, this._contentId));
    }
}