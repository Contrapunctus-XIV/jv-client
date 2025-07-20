/**
 * @module classes
 */

import { load } from "cheerio";
import { InexistentContent } from "../errors.js";
import { request } from "../requests.js";
import { DOMAIN, HTTP_CODES, POST_SELECTORS } from "../vars.js";
import { checkInteger, convertJVCStringToDate } from "../utils.js";
import JVCode from "../scrapers/JVCode.js";
import Topic from "./Topic.js";
import Client from "./Client.js";
import { JVCTypes } from "../types/index.js";

/**
 * Classe représentant un message sur un {@link Topic}. Utilise le site JVC.
 *
 */
export default class Post {
    private _id: number;
    private _url: string;

    /**
     * Crée une instance de la classe `Post`.
     * @param {number} id ID du post
     */
    constructor(id: number) {
        checkInteger(id);
        this._id = id;
        this._url = `https://${DOMAIN}/forums/message/${this._id}`;
    }

    /**
     * Renvoie l'ID du post.
     *
     * @readonly
     * @type {number}
     */
    get id(): number {
        return this._id;
    }

    /**
     * Renvoie l'URL du post.
     *
     * @readonly
     * @type {string}
     */
    get url(): string {
        return this._url;
    }

    /**
     * Renvoie `true` si le post existe, `false` sinon.
     *
     * @returns  {Promise<boolean>}
     */
    async doesPostExist(): Promise<boolean> {
        const response = await request(this._url, { curl: true });

        return response.ok;
    }

    /**
     * @hidden
     *
     * @param {Response} response
     */
    _rejectIfInexistent(response: Response): void {
        if (response.status === HTTP_CODES.NOT_FOUND) {
            throw new InexistentContent(`Post of ID ${this.id} does not exist.`);
        }
    }

    /**
     * Renvoie les informations du post. Nécessite une instance connectée de {@link Client}.
     *
     * @param {Client} client client connecté
     * @throws {@link errors.InexistentContent | InexistentContent} si le post n'existe pas
     * @throws {@link errors.NotConnected | NotConnected} si le client n'est pas connecté
     * @returns  {Promise<JVCTypes.Post.Infos>}
     */
    async getInfos(client: Client): Promise<JVCTypes.Post.Infos> {
        client.assertConnected();
        
        const response = await request(this._url, { cookies: client.session, curl: true });

        this._rejectIfInexistent(response);

        const $ = load(await response.text());
        const author = $(POST_SELECTORS["author"]).text().trim();
        const date = convertJVCStringToDate($(POST_SELECTORS["date"]).text().trim())!;
        const content = JVCode.htmlToJVCode($(POST_SELECTORS["content"]).html()!.trim());
        const topicId = Topic._getIdFromUrl($(POST_SELECTORS["topic"]).attr("href")!);
        const page = Topic._getPageFromUrl($(POST_SELECTORS["topic"]).attr("href")!);

        return {
            id: this._id,
            url: this._url,
            author,
            date,
            content,
            topicId,
            page
        };
    }
}