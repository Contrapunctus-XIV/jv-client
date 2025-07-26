/**
 * @module classes
 */

import Client from "./Client.js";
import { requestApi, request } from '../requests.js';
import Game from "./Game.js";
import Forum from "./Forum.js";
import Topic from "./Topic.js";
import { decodeJvCare } from "../utils.js";
import { JvcErrorMessage } from "../errors.js";
import Post from "./Post.js";
import { CDV_POSTS_URL, MAXIMUM_PER_PAGE, SELECTORS } from "../vars.js";
import { load } from "cheerio";
import { LibTypes, V4Types } from "../types/index.js";
import { readFileSync } from "node:fs";

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
     * @throws {@link errors.NotConnected | `NotConnected`} si le client n'est pas connecté
     * @returns  {Promise<V4Types.Account.Infos>}
     */
    async getInfos(): Promise<V4Types.Account.Infos> {
        this._client.assertConnected();
        const route = 'accounts/me/profile';
        const response = await requestApi(route, { cookies: this._client.session });

        const data = await response.json() as V4Types.Account.Infos;
        return data;
    }

    /**
     * Renvoie la page (contenus et reviews) du compte.
     *
     * @throws {@link errors.NotConnected | `NotConnected`} si le client n'est pas connecté
     * @returns  {Promise<V4Types.Account.Page.Raw>}
     */
    async getPage(): Promise<V4Types.Account.Page.Raw> {
        this._client.assertConnected();
        const route = 'accounts/me/page';
        const response = await requestApi(route, { cookies: this._client.session });

        const data = await response.json() as V4Types.Account.Page.Raw;
        return data;
    }

    /**
     * @hidden
     */
    private async getFavorites(options: LibTypes.Args.Raw): Promise<V4Types.Account.Favorites.Raw>;
    /**
     * @hidden
     */
    private async getFavorites(options?: LibTypes.Args.NotRaw): Promise<V4Types.Account.Favorites.Default>;
    /**
     * Renvoie les forums, topics et jeux vidéo favoris du compte.
     * 
     * @hidden
     * @param {LibTypes.Args.NotRaw} [options]
     * @param {boolean} [options.raw]  `true` pour renvoyer un objet JSON brut ({@link V4Types.Account.Favorites.Raw}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link V4Types.Account.Favorites.Default})
     * @throws {@link errors.NotConnected | `NotConnected`} si le client n'est pas connecté
     * @returns  {(Promise<V4Types.Account.Favorites.Default | V4Types.Account.Favorites.Raw>)}
     */
    private async getFavorites(options?: LibTypes.Args.NotRaw): Promise<V4Types.Account.Favorites.Default | V4Types.Account.Favorites.Raw>;
    private async getFavorites({ raw = false }: LibTypes.Args.NotRaw = {}): Promise<V4Types.Account.Favorites.Default | V4Types.Account.Favorites.Raw> {
        this._client.assertConnected();
        const route = 'accounts/me/favorites/topics';
        const response = await requestApi(route, { cookies: this._client.session, query: { perPage: 20} });

        const data = await response.json() as V4Types.Account.Favorites.Raw;

        return raw ? data : {
            games: data.games.items.map(game => new Game(game.id)),
            forums: data.forums.items.map(forum => new Forum(forum.id)),
            topics: data.topics.items.map(topic => new Topic(topic.id))
        }
    }

    /**
     * @hidden
     */
    async getFavoriteTopics(options: LibTypes.Args.Raw): Promise<V4Types.Account.Favorites.FavoriteTopics>;
    /**
    * @hidden
    */
    async getFavoriteTopics(options?: LibTypes.Args.NotRaw): Promise<Topic[]>;
    /**
     * Renvoie les topics favoris du profil.
     *
     * @param {LibTypes.Args.NotRaw} [options]
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Account.Favorites.FavoriteTopics | `V4Types.Account.Favorites.FavoriteTopics`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Topic | `Topic`})
     * @throws {@link errors.NotConnected | `NotConnected`} si le client n'est pas connecté
     * @returns  {(Promise<V4Types.Account.Favorites.FavoriteTopics | Topic>)}
     */
    async getFavoriteTopics(options?: LibTypes.Args.NotRaw): Promise<V4Types.Account.Favorites.FavoriteTopics | Topic[]>;
    async getFavoriteTopics({ raw = false }: LibTypes.Args.NotRaw = {}): Promise<V4Types.Account.Favorites.FavoriteTopics | Topic[]> {
        this._client.assertConnected();
        const route = 'accounts/me/favorites/topics';
        const response = await requestApi(route, { cookies: this._client.session, query: { perPage: MAXIMUM_PER_PAGE } });

        const data = await response.json() as V4Types.Account.Favorites.FavoriteTopics;

        return raw ? data : data.items.map(item => new Topic(item.id));
    }

    /**
     * @hidden
     */
    async getFavoriteForums(options: LibTypes.Args.Raw): Promise<V4Types.Account.Favorites.FavoriteForums>;
    /**
    * @hidden
    */
    async getFavoriteForums(options?: LibTypes.Args.NotRaw): Promise<Forum[]>;
    /**
     * Renvoie les forums favoris du profil.
     *
     * @param {LibTypes.Args.NotRaw} [options]
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Account.Favorites.FavoriteForums | `V4Types.Account.Favorites.FavoriteForums`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Forum | `Forum`})
     * @throws {@link errors.NotConnected | `NotConnected`} si le client n'est pas connecté
     * @returns  {(Promise<V4Types.Account.Favorites.FavoriteForums | Forum>)}
     */
    async getFavoriteForums(options?: LibTypes.Args.NotRaw): Promise<V4Types.Account.Favorites.FavoriteForums | Forum[]>;
    async getFavoriteForums({ raw = false }: LibTypes.Args.NotRaw = {}): Promise<V4Types.Account.Favorites.FavoriteForums | Forum[]> {
        this._client.assertConnected();
        const route = 'accounts/me/favorites/forums';
        const response = await requestApi(route, { cookies: this._client.session, query: { perPage: MAXIMUM_PER_PAGE } });

        const data = await response.json() as V4Types.Account.Favorites.FavoriteForums;

        return raw ? data : data.items.map(item => new Forum(item.id));
    }

    /**
     * @hidden
     */
    async getFavoriteGames(options: LibTypes.Args.Raw): Promise<V4Types.Account.Favorites.FavoriteGames>;
    /**
    * @hidden
    */
    async getFavoriteGames(options?: LibTypes.Args.NotRaw): Promise<Game[]>;
    /**
     * Renvoie les jeux favoris du compte.
     *
     * @param {LibTypes.Args.NotRaw} [options]
     * @param {boolean} [options.raw] `true` pour renvoyer un objet JSON brut ({@link V4Types.Account.Favorites.FavoriteGames | `V4Types.Account.Favorites.FavoriteGames`}), par défaut `false` pour utiliser les classes fournies par la librairie ({@link Game | `Game`})
     * @throws {@link errors.NotConnected | `NotConnected`} si le client n'est pas connecté
     * @returns  {(Promise<V4Types.Account.Favorites.FavoriteGames | Game>)}
     */
    async getFavoriteGames(options?: LibTypes.Args.NotRaw): Promise<V4Types.Account.Favorites.FavoriteGames | Game[]>;
    async getFavoriteGames({ raw = false }: LibTypes.Args.NotRaw = {}): Promise<V4Types.Account.Favorites.FavoriteGames | Game[]> {
        this._client.assertConnected();
        const route = 'accounts/me/favorites/games';
        const response = await requestApi(route, { cookies: this._client.session, query: { perPage: MAXIMUM_PER_PAGE } });

        const data = await response.json() as V4Types.Account.Favorites.FavoriteGames;

        return raw ? data : data.items.map(item => new Game(item.id, { machineId: item.machine }));
    }


    /**
     * Modifie les forums favoris du compte.
     *
     * @param {(number[] | Forum[])} forums tableau contenant les forums cibles des modifications
     * @param {LibTypes.Args.Profile.FavoriteOptions} [options]
     * @param {"add" | "update" | "remove"} [options.mode] `"add"` pour ajouter les entrées aux favoris, `"update"` pour remplacer les favoris existants par les entrées (comportement par défaut), `"delete"` pour retirer les entrées de la liste des favoris
     * @throws {@link errors.NotConnected | `NotConnected`} si le client n'est pas connecté
     */
    async editFavoriteForums(forums: number[] | Forum[], { mode = "update" }: LibTypes.Args.Profile.FavoriteOptions = {}): Promise<V4Types.Account.Favorites.FavoriteForum[]> {
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
        const response = await requestApi(route, { method, data: { forums: forumsIds }, cookies: this._client.session });
        
        Profile.detectError(response);

        const data = await response.json() as V4Types.Account.Favorites.FavoriteForums;
        return data.items;
    }

    /**
     * Modifie les jeux favoris du compte.
     *
     * @param {{ id: number; machine: number; }[]} games tableau contenant les jeux (ID et machine) cibles des modifications
     * @param {LibTypes.Args.Profile.FavoriteOptions} [options]
     * @param {"add" | "update" | "remove"} [options.mode] `"add"` pour ajouter les entrées aux favoris, `"update"` pour remplacer les favoris existants par les entrées (comportement par défaut), `"delete"` pour retirer les entrées de la liste des favoris
     * @throws {@link errors.NotConnected | `NotConnected`} si le client n'est pas connecté
     */
    async editFavoriteGames(games: { id: number; machine: number; }[], { mode = "update" }: LibTypes.Args.Profile.FavoriteOptions = {}): Promise<V4Types.Account.Favorites.FavoriteGame[]> {
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
        const response = await requestApi(route, { method, data: { games }, cookies: this._client.session });
        Profile.detectError(response);

        const data = await response.json() as V4Types.Account.Favorites.FavoriteGames;
        return (await this.getFavoriteGames({ raw: true })).items;
    }

    /**
     * Modifie les topics favoris du compte.
     *
     * @param {number[] | Topic[]} topics tableau contenant les topics cibles des modifications
     * @param {LibTypes.Args.Profile.FavoriteOptions} [options]
     * @param {"add" | "update" | "remove"} [options.mode] `"add"` pour ajouter les entrées aux favoris, `"update"` pour remplacer les favoris existants par les entrées (comportement par défaut), `"delete"` pour retirer les entrées de la liste des favoris
     * @throws {@link errors.NotConnected | `NotConnected`} si le client n'est pas connecté
     */
    async editFavoriteTopics(topics: number[] | Topic[], { mode = "update" } : LibTypes.Args.Profile.FavoriteOptions = {}): Promise<V4Types.Account.Favorites.FavoriteTopic[]> {
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
        const response = await requestApi(route, { method, data: { topics: topicsIds }, cookies: this._client.session });
        Profile.detectError(response);

        const data = await response.json() as V4Types.Account.Favorites.FavoriteTopics;
        return data.items;
    }

    /**
     * Remplace l'image de profil par le fichier image passé en entrée.
     *
     * @param {string} file la nouvelle image de profil. Peut être un chemin pointant vers le fichier (`string`), une URL (objet {@link !URL | `URL`}) ou un `Buffer`
     * @throws {@link errors.NotConnected | `NotConnected`} si le client n'est pas connecté
     * @throws {@link errors.JvcErrorMessage | `JvcErrorMessage`} si le téléversement a échoué (fichier invalide)
     * @returns  {Promise<void>}
     */
    async setAvatar(file: string | URL | Buffer): Promise<void> {
        this._client.assertConnected();
        let buffer;

        if (typeof file === "string") {
            buffer = readFileSync(file);
        } else if (file instanceof URL) {
            buffer = await request(file.toString());
            buffer = Buffer.from(await buffer.arrayBuffer())
        } else {
            buffer = file;
        }
        
        const route = 'accounts/me/avatar';
        const response = await requestApi(route, { method: "PUT", data: buffer, headers: { 'content-type': 'application/octet-stream' }, cookies: this._client.session, bodyMode: "any" });
        Profile.detectError(response);
    }

    /**
     * @hidden
     */
    private async setCover(filepath: string): Promise<void> {
        this._client.assertConnected();
        const stream = readFileSync(filepath);
        const route = 'accounts/me/cover';
        const response = await requestApi(route, { method: "PUT", data: stream, headers: { 'content-type': 'application/octet-stream' }, cookies: this._client.session, bodyMode: "any" });
        Profile.detectError(response);
    }

    /**
     * Modifie la description du profil.
     *
     * @param {string} description nouvelle description
     * @throws {@link errors.NotConnected | `NotConnected`} si le client n'est pas connecté
     * @returns  {Promise<void>}
     */
    async setDescription(description: string): Promise<void> {
        this._client.assertConnected();
        const route = 'accounts/me/profile/description';
        const response = await requestApi(route, { method: 'PUT', data: { description }, cookies: this._client.session });
        Profile.detectError(response);
    }

    /**
     * Renvoie la liste des messages du compte sous forme de générateur asynchrone.
     * Cette méthode est lente car JVC renvoie des erreurs 403 si trop de requêtes sont envoyées sur un profil.
     *
     * @throws {@link errors.NotConnected | `NotConnected`} si le client n'est pas connecté
     * @returns  {AsyncGenerator<Post, void, unknown>}
     */
    async * getForumPosts(): AsyncGenerator<Post, void, unknown> {
        this._client.assertConnected();
        let url = CDV_POSTS_URL.replace("*", this._client.alias!.toLowerCase());
        
        while (true) {
            const response = await request(url, { cookies: this._client.session, curl: true });
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