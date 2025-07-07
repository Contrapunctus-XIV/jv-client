/**
 * @module classes
 */

import Client from "./Client.js";
import { callApi, curl } from '../requests.js';
import Game from "./Game.js";
import Forum from "./Forum.js";
import Topic from "./Topic.js";
import { decodeJvCare, readFileAsBytes } from "../utils.js";
import { JvcErrorMessage } from "../errors.js";
import Post from "./Post.js";
import { CDV_POSTS_URL, SELECTORS } from "../vars.js";
import { load } from "cheerio";
import { JVCTypes, LibTypes, V4Types } from "../types/index.js";

/**
 * Classe permettant des opérations sur le profil public d'un compte JVC. Utilise l'API `v4` et nécessite un {@link Client} connecté.
 *
 */
export default class Profile {
    private _client: Client;

    /**
     * Crée une instance de `Profile`.
     * @param {Client} client un client connecté
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
     * Renvoie la page de profil du compte.
     *
     * @throws {@link errors.NotConnected | NotConnected} si le client n'est pas connecté
     * @returns  {Promise<V4Types.Account.Infos>}
     */
    async getInfos(): Promise<V4Types.Account.Infos> {
        this._client.assertConnected();
        const route = 'accounts/me/profile';
        const response = await callApi(route, { cookies: this._client.session });

        const data = await response.json() as V4Types.Account.Infos;
        return data;
    }

    /**
     * Renvoie la page (contenus et reviews) du compte.
     *
     * @throws {@link errors.NotConnected | NotConnected} si le client n'est pas connecté
     * @returns  {Promise<V4Types.Account.Page.Raw>}
     */
    async getPage(): Promise<V4Types.Account.Page.Raw> {
        this._client.assertConnected();
        const route = 'accounts/me/page';
        const response = await callApi(route, { cookies: this._client.session });

        const data = await response.json() as V4Types.Account.Page.Raw;
        return data;
    }

    /**
     * @hidden
     */
    async getFavorites(options: { raw: true }): Promise<V4Types.Account.Favorites.Raw>;
    /**
     * @hidden
     */
    async getFavorites(options?: { raw?: boolean }): Promise<V4Types.Account.Favorites.Default>;
    /**
     * Renvoie les forums, topics et jeux vidéo favoris du compte.
     *
     * @param {{ raw?: boolean }} [options]
     * @param {boolean} [options.raw]  `true` pour renvoyer un objet JSON brut ({@link V4Types.Account.Favorites.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link V4Types.Account.Favorites.Default})
     * @throws {@link errors.NotConnected | NotConnected} si le client n'est pas connecté
     * @returns  {(Promise<V4Types.Account.Favorites.Default | V4Types.Account.Favorites.Raw>)}
     */
    async getFavorites(options?: { raw?: boolean }): Promise<V4Types.Account.Favorites.Default | V4Types.Account.Favorites.Raw>;
    async getFavorites({ raw = false }: { raw?: boolean } = {}): Promise<V4Types.Account.Favorites.Default | V4Types.Account.Favorites.Raw> {
        this._client.assertConnected();
        const route = 'accounts/me/favorites';
        const response = await callApi(route, { cookies: this._client.session });

        const data = await response.json() as V4Types.Account.Favorites.Raw;

        return raw ? data : {
            games: data.games.items.map((game: any) => new Game(game.id)),
            forums: data.forums.items.map((forum: any) => new Forum(forum.id)),
            topics: data.topics.items.map((topic: any) => new Topic(topic.id))
        }
    }

    /**
     * Modifie les forums favoris du compte.
     *
     * @param {(number[] | Forum[])} forums tableau contenant les forums cibles des modifications
     * @param {({ mode?: "add" | "set" | "remove" })} [options]
     * @param {"add" | "update" | "remove"} [options.mode] `"add"` pour ajouter les entrées aux favoris, `"update"` pour remplacer les favoris existants par les entrées (comportement par défaut), `"delete"` pour retirer les entrées de la liste des favoris
     * @throws {@link errors.NotConnected | NotConnected} si le client n'est pas connecté
     * @returns  {Promise<void>}
     */
    async editFavoriteForums(forums: number[] | Forum[], { mode = "update" }: { mode?: "add" | "update" | "remove" } = {}): Promise<void> {
        this._client.assertConnected();
        const route = 'accounts/me/favorites/forums';
        let method: LibTypes.Requests.HttpMethod;

        switch (mode) {
            case "update":
                method = "PUT";
                break;
            case "add":
                method = "POST";
                break;
            case "remove":
                method = "DELETE";
                break;
        }

        const forumsIds = forums.map((forum: number | Forum) => forum instanceof Forum ? forum.id : forum);
        const response = await callApi(route, { method, data: { forums: forumsIds }, cookies: this._client.session });
        Profile.detectError(response);
    }

    /**
     * Modifie les jeux favoris du compte.
     *
     * @param {{ id: number; machine: number; }[]} games tableau contenant les jeux (ID et machine) cibles des modifications
     * @param {({ mode?: "add" | "update" | "remove" })} [options]
     * @param {"add" | "update" | "remove"} [options.mode] `"add"` pour ajouter les entrées aux favoris, `"update"` pour remplacer les favoris existants par les entrées (comportement par défaut), `"delete"` pour retirer les entrées de la liste des favoris
     * @throws {@link errors.NotConnected | NotConnected} si le client n'est pas connecté
     * @returns  {Promise<void>}
     */
    async editFavoriteGames(games: { id: number; machine: number; }[], { mode = "update" }: { mode?: "add" | "update" | "remove" } = {}): Promise<void> {
        this._client.assertConnected();
        let method: LibTypes.Requests.HttpMethod;

        switch (mode) {
            case "update":
                method = "PUT";
                break;
            case "add":
                method = "POST";
                break;
            case "remove":
                method = "DELETE";
                break;
        }

        const route = 'accounts/me/favorites/games';
        const response = await callApi(route, { method, data: { games }, cookies: this._client.session });
        Profile.detectError(response);
    }

    /**
     * Modifie les topics favoris du compte.
     *
     * @param {number[] | Topic[]} topics tableau contenant les topics cibles des modifications
     * @param {({ mode?: "add" | "update" | "remove" })} [options]
     * @param {"add" | "update" | "remove"} [options.mode] `"add"` pour ajouter les entrées aux favoris, `"update"` pour remplacer les favoris existants par les entrées (comportement par défaut), `"delete"` pour retirer les entrées de la liste des favoris
     * @throws {@link errors.NotConnected | NotConnected} si le client n'est pas connecté
     * @returns  {Promise<void>}
     */
    async editFavoriteTopics(topics: number[] | Topic[], { mode = "update" } : { mode?: "add" | "update" | "remove" } = {}): Promise<void> {
        this._client.assertConnected();
        let method: LibTypes.Requests.HttpMethod;

        switch (mode) {
            case "update":
                method = "PUT";
                break;
            case "add":
                method = "POST";
                break;
            case "remove":
                method = "DELETE";
                break;
        }

        const route = 'accounts/me/favorites/topics';
        const topicsIds = topics.map((topic: number | Topic) => topic instanceof Topic ? topic.id : topic);
        const response = await callApi(route, { method, data: { topics: topicsIds }, cookies: this._client.session });
        Profile.detectError(response);
    }

    /**
     * Remplace l'avatar de profil par le fichier dont le chemin est donné en entrée.
     *
     * @param {string} filePath chemin du fichier
     * @throws {@link errors.NotConnected | NotConnected} si le client n'est pas connecté
     * @throws {@link errors.JvcErrorMessage | JvcErrorMessage} si le fichier fourni est invalide (pas une image ou trop volumineux)
     * @returns  {Promise<void>}
     */
    async setAvatar(filePath: string): Promise<void> {
        this._client.assertConnected();
        const stream = await readFileAsBytes(filePath);
        const route = 'accounts/me/avatar';
        const response = await callApi(route, { method: "PUT", data: stream, headers: { 'content-type': 'application/octet-stream' }, cookies: this._client.session });
        Profile.detectError(response);
    }

    /**
     * @hidden
     */
    private async setCover(filePath: string): Promise<void> {
        this._client.assertConnected();
        const stream = await readFileAsBytes(filePath);
        const route = 'accounts/me/cover';
        const response = await callApi(route, { method: "PUT", data: stream, headers: { 'content-type': 'application/octet-stream' }, cookies: this._client.session });
        Profile.detectError(response);
    }

    /**
     * Modifie la description du profil.
     *
     * @param {string} description nouvelle description
     * @throws {@link errors.NotConnected | NotConnected} si le client n'est pas connecté
     * @returns  {Promise<void>}
     */
    async setDescription(description: string): Promise<void> {
        this._client.assertConnected();
        const route = 'accounts/me/profile/description';
        const response = await callApi(route, { method: 'PUT', data: { description }, cookies: this._client.session });
        Profile.detectError(response);
    }

    /**
     * Renvoie la liste des messages du compte sous forme de générateur asynchrone.
     * Cette méthode est lente car JVC renvoie des erreurs 403 si trop de requêtes sont envoyées sur un profil.
     *
     * @throws {@link errors.NotConnected | NotConnected} si le client n'est pas connecté
     * @returns  {AsyncGenerator<Post, void, unknown>}
     */
    async * getForumPosts(): AsyncGenerator<Post, void, unknown> {
        this._client.assertConnected();
        let url = CDV_POSTS_URL.replace("*", this._client.alias!.toLowerCase());
        
        while (true) {
            const response = await curl(url, { cookies: this._client.session });
            const $ = load(await response.text());
            const posts = $(SELECTORS["cdvPost"]);

            for (const post of posts.get()) {
                const id = parseInt($(post).attr("data-id")!);
                yield new Post(id);
            }

            const nextPageBtn = $(SELECTORS["cdvNextPage"]);

            if (nextPageBtn.length === 0) {
                break;
            }

            url = decodeJvCare(nextPageBtn.attr("class")!);
        }
    }
}