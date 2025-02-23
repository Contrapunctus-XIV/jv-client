/**
 * @module classes
 */

import { JvcErrorMessage } from "../errors.js";
import { callApi } from "../requests.js";
import { HTTP_CODES } from "../vars.js";
import Client from "./Client.js";
import Content from "./Content.js";
import ContentComment from "./ContentComment.js";
import Game from "./Game.js";
import Review from "./Review.js";

/**
 * Classe permettant des interactions avec les contenus du site. Utilise l'API v4 et nécessite un {@link Client} connecté.
 *
 */
export default class V4Client {
    private _client: Client;

    /**
     * Crée une instance de `V4Client`.
     * @param {Client} client 
     */
    constructor(client: Client) {
        this._client = client;
    }

    private static async detectError(response: Response): Promise<void> {
        try {
            const data = await response.clone().json();
            if (!response.ok && data.message) {
                throw new JvcErrorMessage(`${data.message} (status ${response.status})`);
            }
        } catch (e: any) {
            if (e instanceof JvcErrorMessage) {
                throw e;
            }
        }
    }

    /**
     * Ajoute un commentaire sur le contenu passé en entrée et renvoie un objet le représentant.
     *
     * @param {Content} content instance représentant le contenu
     * @param {string} text corps du commentaire
     * @throws {@link errors.InexistentContent | NotConnected} si le client n'est pas connecté
     * @throws {@link errors.InexistentContent | InexistentContent} si le contenu n'existe pas
     * @throws {@link errors.InexistentContent | JvcErrorMessage} si le compte est banni ou si le message est invalide
     * @returns  {Promise<V4Types.Content.Comment.Infos>}
     */
    async addComment(content: Content, text: string): Promise<V4Types.Content.Comment.Infos> {
        // erreur 409 si message invalide
        this._client.assertConnected();
        const route = `contents/${content.id}/comments`;

        const response = await callApi(route, { method: 'POST', data: { content: text }, cookies: this._client.session, allowedStatusErrors: [HTTP_CODES.NOT_FOUND, HTTP_CODES.CONFLICT] });
        content._rejectIfInexistent(response);
        V4Client.detectError(response)

        const data = await response.json() as V4Types.Content.Comment.Infos;

        return data;
    }

    /**
     * Ajoute un vote positif ou négatif sur un commentaire.
     *
     * @param {ContentComment} comment instance représentant le commentaire
     * @param {(1 | -1)} vote 1 : positif, -1 : négatif
     * @throws {@link errors.InexistentContent | NotConnected} si le client n'est pas connecté
     * @throws {@link errors.InexistentContent | InexistentContent} si le commentaire n'existe pas
     * @returns  {Promise<void>}
     */
    async addCommentVote(comment: ContentComment, vote: 1 | -1): Promise<void> {
        // pas strict sur parent id
        // renvoie 409 quand le commentaire n'existe pas : on ne peut pas différencier d'une erreur de perms
        this._client.assertConnected();
        const route = `contents/${comment.contentId}/comments/${comment.id}/vote`;
        const response = await callApi(route, { method: 'POST', data: { type: vote }, cookies: this._client.session, allowedStatusErrors: [HTTP_CODES.NOT_FOUND, HTTP_CODES.CONFLICT] });
        comment._rejectIfInexistent(response);
        V4Client.detectError(response);
    }

    /**
     * Ajoute une réponse sous un commentaire et renvoie un objet la représentant.
     *
     * @param {ContentComment} comment instance représentant le commentaire
     * @param {string} text corps de la réponse
     * @throws {@link errors.InexistentContent | NotConnected} si le client n'est pas connecté
     * @throws {@link errors.InexistentContent | InexistentContent} si le commentaire n'existe pas
     * @throws {@link errors.InexistentContent | JvcErrorMessage} si le compte est banni ou si le message est invalide
     * @returns  {Promise<V4Types.Content.Comment.Infos>}
     */
    async addAnswer(comment: ContentComment, text: string): Promise<V4Types.Content.Comment.Infos> {
        // strict sur id du contenu parent : erreur 404 si le contenu n'existe pas
        // ce problème est résolu par l'appel préliminaire à comment.getInfos()
        this._client.assertConnected();
        const infos = await comment.getInfos();
        let commentId = comment.id;
        if (infos.idParent) { // si le commentaire est une réponse, besoin de répondre au commentaire parent sinon la réponse n'est pas postée
            commentId = infos.idParent;
        }

        const route = `contents/${comment.contentId}/comments/${commentId}/answers`;
        const response = await callApi(route, { method: 'POST', data: { content: text }, cookies: this._client.session, allowedStatusErrors: [HTTP_CODES.NOT_FOUND, HTTP_CODES.CONFLICT] });

        comment._rejectIfInexistent(response);
        V4Client.detectError(response);

        const data = await response.json() as V4Types.Content.Comment.Infos;
        return data;
    }

    /**
     * Retire le commentaire.
     *
     * @param {ContentComment} comment instance représentant le commentaire
     * @throws {@link errors.InexistentContent | NotConnected} si le client n'est pas connecté
     * @throws {@link errors.InexistentContent | InexistentContent} si le contenu n'existe pas
     * @throws {@link errors.InexistentContent | JvcErrorMessage} si le commentaire n'appartient pas au compte
     * @returns  {Promise<void>}
     */
    async deleteComment(comment: ContentComment): Promise<void> {
        // tester si on peut effectuer en étant banni
        // renvoie 404 quand le commentaire n'existe pas
        // statut 409 si problème de permissions
        this._client.assertConnected();
        const route = `contents/${comment.contentId}/comments/${comment.id}`;
        const response = await callApi(route, { method: "DELETE", cookies: this._client.session, allowedStatusErrors: [HTTP_CODES.NOT_FOUND, HTTP_CODES.CONFLICT] });

        comment._rejectIfInexistent(response);
        V4Client.detectError(response);
    }

    /**
     * Supprime le vote donné à un commentaire.
     *
     * @param {ContentComment} comment instance représentant le commentaire
     * @returns  {Promise<void>}
     */
    async deleteCommentVote(comment: ContentComment): Promise<void> {
        // tester si on peut effectuer en étant banni
        // pas strict sur id du contenu parent
        // renvoie 204 dans tous les cas, pas de JSON
        this._client.assertConnected();
        const route = `contents/${comment.contentId}/comments/${comment.id}/vote`;
        const response = await callApi(route, { method: "DELETE", cookies: this._client.session });
        comment._rejectIfInexistent(response);
    }

    /**
     * Modifie le texte du commentaire et renvoie un objet représentant le commentaire mis à jour.
     *
     * @param {ContentComment} comment instance représentant le commentaire
     * @param {string} text nouveau texte
     * @throws {@link errors.InexistentContent | NotConnected} si le client n'est pas connecté
     * @throws {@link errors.InexistentContent | InexistentContent} si le commentaire n'existe pas
     * @throws {@link errors.InexistentContent | JvcErrorMessage} si le commentaire n'appartient pas au compte, si le compte est banni ou si le message est invalide
     * @returns  {Promise<V4Types.Content.Comment.Infos>}
     */
    async updateComment(comment: ContentComment, text: string): Promise<V4Types.Content.Comment.Infos> {
        // tester si on peut effectuer en étant banni
        // strict sur id du contenu parent
        // statut 409 quand problème de permissions
        this._client.assertConnected();
        const route = `contents/${comment.contentId}/comments/${comment.id}`;
        const response = await callApi(route, { method: "PUT", data: { content: text }, cookies: this._client.session, allowedStatusErrors: [HTTP_CODES.NOT_FOUND, HTTP_CODES.CONFLICT] });
        
        comment._rejectIfInexistent(response);
        await V4Client.detectError(response);
        const data = await response.json();
        return data as V4Types.Content.Comment.Infos;
    }

    /**
     * @hidden
     */
    private async restoreComment(comment: ContentComment): Promise<V4Types.Content.Comment.Infos> {
        // tester si on peut effectuer en étant banni
        // strict sur id du contenu parent
        // statut 404 si le commentaire n'existe pas
        // statut 409 si problème de permissions
        this._client.assertConnected();
        const route = `contents/${comment.contentId}/comments/${comment.id}`;
        const response = await callApi(route, { method: "POST", cookies: this._client.session, allowedStatusErrors: [HTTP_CODES.NOT_FOUND, HTTP_CODES.CONFLICT] });
        comment._rejectIfInexistent(response);
        V4Client.detectError(response);

        const data = await response.json();
        return data as V4Types.Content.Comment.Infos;
    }

    /**
     * Ajoute un avis sur un jeu vidéo passé en entrée et renvoie un objet le représentant
     *
     * @param {Game} game instance représentant le jeu
     * @param {number} machineId ID de la machine sur laquelle l'avis est posté
     * @param {number} mark note comprise entre 0 et 20
     * @param {string} text corps de l'avis
     * @param {{ onProfile?: boolean }} [options]
     * @param {boolean} [options.onProfile] `true` pour faire apparaître l'avis sur la page de profil (par défaut)
     * @throws {@link errors.InexistentContent | NotConnected} si le client n'est pas connecté
     * @throws {@link errors.InexistentContent | InexistentContent} si le jeu n'existe pas ou si le jeu n'existe pas sur la machine renseignée
     * @throws {@link errors.InexistentContent | JvcErrorMessage} si le compte est banni, si le message ou la note est invalide
     * @returns  {Promise<V4Types.Game.Review.Infos>}
     */
    async addReview(game: Game, machineId: number, mark: number, text: string, { onProfile = true }: { onProfile?: boolean } = {}): Promise<V4Types.Game.Review.Infos> {
        this._client.assertConnected();
        const route = `games/${game.id}/${machineId}/reviews/users`;
        const response = await callApi(route, { method: 'POST', data: { content: text, mark, onProfile }, cookies: this._client.session, allowedStatusErrors: [HTTP_CODES.NOT_FOUND, HTTP_CODES.CONFLICT] });
        
        game._rejectIfInexistent(response, machineId);
        V4Client.detectError(response);
        const data = await response.json();

        return data;
    }

    /**
     * Supprime l'avis.
     *
     * @param {Review} review instance représentant l'avis
     * @throws {@link errors.InexistentContent | NotConnected} si le client n'est pas connecté
     * @throws {@link errors.InexistentContent | InexistentContent} si l'avis n'existe pas
     * @returns  {Promise<void>}
     */
    async deleteReview(review: Review): Promise<void> {
        // tester si on peut supprimer en étant banni
        // pas strict sur id du contenu parent
        this._client.assertConnected();
        const route = `games/${review.gameId}/${review.machineId}/reviews/users/${review.id}`;
        const response = await callApi(route, { method: "DELETE", cookies: this._client.session, allowedStatusErrors: [HTTP_CODES.NOT_FOUND, HTTP_CODES.CONFLICT] });

        review._rejectIfInexistent(response);
        V4Client.detectError(response);
    }

    /**
     * @hidden
     */
    private async restoreReview(review: Review): Promise<void> {
        // tester si on peut supprimer en étant banni
        // pas strict sur id du contenu parent
        // renvoie 404 dans tous les cas !
        this._client.assertConnected();
        const route = `games/${review.gameId}/${review.machineId}/reviews/users/${review.id}`;
        const response = await callApi(route, { method: "POST", cookies: this._client.session, allowedStatusErrors: [HTTP_CODES.NOT_FOUND, HTTP_CODES.CONFLICT] });

        //review._rejectIfInexistent(response);
        //V4Client.detectError(response);
    }
}