/**
 * @module classes
 */

import { JvcErrorMessage, JvcResponseError, NotConnected } from "../errors.js";
import { callApi } from "../requests.js";
import { sleep } from "../utils.js";
import { CONNECTION_DELAY, HTTP_CODES } from "../vars.js";
import Account from "./Account.js";

/**
 * Classe représentant une connexion à un compte JVC.
 * 
 */
export default class Client {
    private _alias: string | undefined;
    private _session: Record<string, string>;
    private _id: number | undefined;
    private _connected: boolean;

    /**
     * Crée une instance de la classe `Client`.
     */
    constructor() {
        this._alias = undefined;
        this._session = { coniunctio: '' };
        this._id = undefined;
        this._connected = false;
    }

    /**
     * Renvoie un objet associant au cookie de connexion sa valeur.
     * 
     * @type {Record<string, string>}
     */
    get session(): Record<string, string> {
        return this._session;
    }

    /**
     * Renvoie un booléen à `true` si le client est connecté à un compte, `false` sinon.
     * 
     * @type {boolean}
     */
    get connected(): boolean {
        return this._connected;
    }

    /**
     * Renvoie le pseudo du client, `undefined` si non connecté.
     *
     * @readonly
     * @type {(string | undefined)}
     */
    get alias(): string | undefined {
        return this._alias;
    }

    /**
     * @hidden
     * @returns {void}
     */
    assertConnected(): void {
        if (!this._connected) {
            throw new NotConnected("This instance of Client is not connected. Please call Client.login or Client.injectConiunctio first.");
        }
    }

    /**
     * @hidden
     * @param {Response} response
     * @returns {Promise<void>}
     */
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
     * Se connecte auprès des serveurs JVC avec un pseudo et un mot de passe puis renvoie le cookie de connexion reçu.
     * 
     * @param {string} alias pseudo JVC
     * @param {string} password mot de passe
     * @throws {@link errors.InexistentContent | JvcErrorMessage} si les identifiants sont incorrects
     * @returns {Promise<string>}
     */
    async login(alias: string, password: string): Promise<string> {
        await this.logout();

        const route = 'accounts/login';
        const response = await callApi(route, { method: 'POST', data: { alias, password }, allowedStatusErrors: [HTTP_CODES.CONFLICT] });
        await Client.detectError(response);
        await sleep(CONNECTION_DELAY);

        try {
            const setCookieHeader = response.headers.get('set-cookie')!;
            const coniunctioCookie = setCookieHeader
                .split(';')
                .find((cookie: string) => cookie.trim().startsWith('coniunctio='))!;

            const data = await response.json() as V4Types.Account.Generic;
            this._id = data.id;
            this._alias = data.alias;

            this._session.coniunctio = coniunctioCookie.split('=')[1];
            await sleep(CONNECTION_DELAY); // délai pour éviter une surcharge auprès du serveur si d'autres requêtes suivent

            this._connected = true;
            return this._session.coniunctio;
        } catch (e: any) {
            throw new JvcResponseError("No coniunctio received. This is unexpected and may result of a bug.");
        }
    }

    /**
     * Stocke le cookie de connexion passé en entrée après vérification de sa validité auprès des serveurs de JVC.
     * Méthode recommandée pour se connecter car n'est pas sujette à un cooldown du serveur si les connexions sont répétées.
     * 
     * @param {string} coniunctio le cookie de connexion
     * @throws {@link errors.InexistentContent | NotConnected} si les identifiants sont incorrects
     * @returns {Promise<void>}
     */
    async injectConiunctio(coniunctio: string): Promise<void> {
        await this.logout();
        const session = { coniunctio };

        await sleep(CONNECTION_DELAY);

        const response = await callApi("accounts/me", { cookies: session, allowedStatusErrors: [HTTP_CODES.UNAUTHORIZED] });
        if (!response.ok) {
            throw new NotConnected("The coniunctio cookie you have provided is not valid.");
        }

        const data = await response.json() as V4Types.Account.Generic;

        this._id = data.id;
        this._alias = data.alias;
        this._session = session;
        this._connected = true;
    }

    /**
     * Envoie une requête aux serveurs de JVC pour signaler la déconnexion. Ne fait rien si le client n'est pas déjà connecté.
     * 
     * @returns {Promise<void>}
     */
    async logout(): Promise<void> {
        if (!this._connected) {
            return;
        }

        await callApi('accounts/logout', { method: 'POST', cookies: this._session });

        this._session.coniunctio = ''
        this._alias = undefined;
        this._connected = false;
    }

    /**
     * Renvoie `true` si le compte associé au client est banni, `false` sinon, `undefined` si le client n'est pas connecté.
     * 
     * @returns {Promise<boolean | undefined>}
     */
    async isBanned(): Promise<boolean | undefined> {
        if (!this._connected || !this._id) {
            return undefined;
        }

        const account = new Account(this._id);
        return account.isBanned();
    }
}