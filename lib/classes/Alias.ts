/**
 * @module classes
 */

import { load } from "cheerio";
import { InexistentContent } from "../errors.js";
import { request } from "../requests.js";
import { CDV_URL, HTTP_CODES, SELECTORS } from "../vars.js";
import Client from "./Client.js";
import { convertJVCStringToDate, decodeAllJvCare } from "../utils.js";
import Account from "./Account.js";
import { JVCTypes } from "../types/index.js";

/**
 * Objet associant aux attributs de la CDV les fonctions permettant de les récupérer. 
 * 
 * @hidden
 */
const CDV_SELECTORS_AND_FUNCTIONS: JVCTypes.CDV.CDV_SELS_AND_FUNCS = {
    "alias": [".infos-pseudo-label", (el: cheerio.Cheerio): string => el.text().trim()],
    "isBanned": [SELECTORS["alert"], (el: cheerio.Cheerio): boolean => true],
    "level": [".user-level", (el: cheerio.Cheerio): number => parseInt(el.text().trim().split(' ')[1])],
    "country": ["li:has(.info-lib:contains('Pays')) .info-value", (el: cheerio.Cheerio): string => el.text().trim()],
    "creationDate": ["li:has(.info-lib:contains('Membre depuis')) .info-value", (el: cheerio.Cheerio): JVCTypes.CDV.CreationDate => {
        const t = el.text();
        const regex = /(\d{1,2}\s+\w+\s+\d{4})\s\((\d+)\sjours\)$/;
        const match = t.match(regex);
        if (match) {
            const [dateStr, daysSince] = match.slice(1);
            return {
                date: convertJVCStringToDate(dateStr),
                daysSince: parseInt(daysSince)
            }
        }
        return {
            date: undefined,
            daysSince: undefined
        }
    }],
    "lastVisit": ["li:has(.info-lib:contains('Dernier passage')) .info-value", (el: cheerio.Cheerio): Date | undefined => convertJVCStringToDate(el.text())],
    "nbMessages": ["li:has(.info-lib:contains('Messages Forums')) .info-value", (el: cheerio.Cheerio): number => parseInt(el.text().split(' ')[0])],
    "nbComments": ["li:has(.info-lib:contains('Commentaires')) .info-value", (el: cheerio.Cheerio): number => parseInt(el.text().split(' ')[0])],
    "description": [".mb-0", (el: cheerio.Cheerio): string => el.text().trim()],
    "signature": [".bloc-signature-desc > div:nth-child(2) > p:nth-child(1)", (el: cheerio.Cheerio): string => el.text().trim()],
    "socialMedias": [".bloc-default-profil:has(.bloc-default-profil-header:contains('Réseaux sociaux'))", (el: cheerio.Cheerio): JVCTypes.CDV.SocialMedias => {
        const res: JVCTypes.CDV.SocialMedias = {
            twitter: undefined,
            youtube: undefined,
            twitch: undefined,
            lastfm: undefined,
            skype: undefined,
            website: undefined
        };

        const socialLinksSelectors = {
            twitter: ".icon-twitter",
            youtube: ".icon-youtube4",
            twitch: ".icon-twitch",
            lastfm: ".icon-lastfm"
        };
        
        const otherMediasSelectors = {
            skype: "li:has(.info-lib:contains('Skype')) .info-value",
            website: "li:has(.info-lib:contains('Blog')) .info-value"
        };

        for (const [media, selector] of Object.entries(socialLinksSelectors)) {
            const mediaEl = el.find(selector);
            if (mediaEl.length > 0) {
                res[media as keyof JVCTypes.CDV.SocialMedias] = mediaEl.attr('href');
            }
        }

        for (const [media, selector] of Object.entries(otherMediasSelectors)) {
            const mediaEl = el.find(selector);
            if (mediaEl.length > 0) {
                res[media as keyof JVCTypes.CDV.SocialMedias] = mediaEl.text().trim();
            }
        }

        return res;
    }],
    "games":[".bloc-default-profil:has(.bloc-default-profil-header:contains('Profil Gamer'))", (el: cheerio.Cheerio): JVCTypes.CDV.Games => {
        const res: JVCTypes.CDV.Games = {
            machines: [],
            genres: [],
            ids: {
                gameCenter: undefined,
                nintendo3DS: undefined,
                nintendoNetwork: undefined,
                origin: undefined,
                playstationNetwork: undefined,
                xboxLive: undefined,
                steam: undefined
            }
        }

        const machinesSelector = ".machine-profil";
        const machinesEl = el.find(machinesSelector);
        if (machinesEl.length > 0) {
            const machines: string[] = [];
            machinesEl.find('.label-tag').each((index: number, element: cheerio.Element) => {
                machines.push(machinesEl.children().eq(index).text().trim());
            });
            res.machines = machines;
        }

        const genresSelector = "li:has(.info-lib:contains('Genre')) .info-value";
        const genresEl = el.find(genresSelector);
        if (genresEl.length > 0) {
            res.genres = genresEl.text().split('•').map((t: string) => t.trim());
        }

        const idsSelector = {
            gameCenter: "li:has(.info-lib:contains('Game Center')) .info-value",
            nintendo3DS: "li:has(.info-lib:contains('Nintendo 3DS')) .info-value",
            nintendoNetwork: "li:has(.info-lib:contains('Nintendo Network')) .info-value",
            origin: "li:has(.info-lib:contains('Origin')) .info-value",
            playstationNetwork: "li:has(.info-lib:contains('PlayStation Network')) .info-value",
            steam: "li:has(.info-lib:contains('Steam')) .info-value",
            xboxLive: "li:has(.info-lib:contains('XBox Live')) .info-value"
        }

        for (const [id, selector] of Object.entries(idsSelector)) {
            const idEl = el.find(selector);
            if (idEl.length > 0) {
                res.ids[id as keyof JVCTypes.CDV.Games["ids"]] = idEl.text().trim();
            }
        }

        return res;
    }]
};

/**
 * Classe prenant en entrée un pseudo et envoyant des requêtes au site JVC à la différence de {@link Account} qui utilise l'API `v4`.
 * 
 */
export default class Alias {
    private _alias: string;
    private _url: string;

    /**
     * Crée une instance de la classe `Alias`.
     * @param {string} alias pseudo du compte
     */
    constructor(alias: string) {
        this._alias = alias;
        this._url = CDV_URL.replace("*", this._alias.toLowerCase());
    }

    /**
     * Renvoie l'URL de la page de profil JVC associée au compte.
     * 
     * @returns {string}
     */
    get url(): string {
        return this._url;
    }

    /**
     * Renvoie le pseudo du compte.
     * 
     * @returns {string}
     */
    get alias(): string {
        return this._alias;
    }

    /**
     * 
     * @private
     * @param {Response} response
     * @returns {void}
     * @hidden
     */
    private _rejectIfInexistent(response: Response): void {
        if (response.status === HTTP_CODES.NOT_FOUND) {
            throw new InexistentContent(`Le compte d'alias ${this._alias} n'existe pas.`);
        }
    }

    /**
     * Renvoie un booléen à `true` si le compte existe, `false` sinon.
     * 
     * @returns {Promise<boolean>}
     */
    async doesAliasExist(): Promise<boolean> {
        const response = await request(this._url, { curl: true });
        return response.ok;
    }

    /**
     * Renvoie un booléen à `true` si le compte est banni, `false` sinon.
     * 
     * @returns {Promise<boolean>}
     * @throws {@link errors.InexistentContent | InexistentContent} si le compte n'existe pas
     */
    async isBanned(): Promise<boolean> {
        const response = await request(this._url, { curl: true });

        this._rejectIfInexistent(response);
        const $ = load(await response.text());
        const isBanned = $(SELECTORS["alert"]).length > 0; // présence d'une div .alert si bannissement
        return isBanned;
    }

    /**
     * Renvoie l'ID du compte. Nécessite un client connecté.
     *
     * @param {Client} client instance connectée de `Client`
     * @throws {@link errors.InexistentContent | InexistentContent} si le compte n'existe pas
     * @throws {@link errors.NotConnected | NotConnected} si le client fourni n'est pas connecté
     * @returns {Promise<number | undefined>}
     */
    async getID(client: Client): Promise<number | undefined> {
        client.assertConnected();

        const response = await request(this._url, { cookies: client.session, curl: true });

        this._rejectIfInexistent(response);
        let url;

        const $ = load(await response.text());
        decodeAllJvCare($);

        const reportSpan = $(SELECTORS["accountReport"]);
        if (reportSpan.length >= 1) {
            const reportUrl = reportSpan.attr("data-selector");
            if (reportUrl) {
                url = reportUrl;
            }
        }
        
        if (!url) {
            const editButton = $(SELECTORS["editProfile"]);
            const editUrl = editButton.attr("href");
            if (!editUrl) {
                return undefined;
            }

            url = editUrl;
        }

        const urlParams = new URLSearchParams(url!.split('?')[1]);
        const id = urlParams.get("id");
        
        return id ? parseInt(id) : undefined;
    }

    /**
     * Renvoie les informations du compte obtenues depuis sa page de profil.
     * 
     * @throws {@link errors.InexistentContent | InexistentContent} si le compte n'existe pas
     * @returns {Promise<JVCTypes.CDV.Infos>}
     */
    async getInfos(): Promise<JVCTypes.CDV.Infos> {
        const result: JVCTypes.CDV.Infos = {
            alias: "",
            isBanned: false,
            level: undefined,
            country: undefined,
            creationDate: undefined,
            lastVisit: undefined,
            nbMessages: undefined,
            nbComments: undefined,
            description: '',
            signature: '',
            socialMedias: undefined,
            games: undefined
        };
    
        const response = await request(this._url, { curl: true });
    
        this._rejectIfInexistent(response);
    
        const html = await response.text();
        const $ = load(html);
        decodeAllJvCare($);
    
        for (const [k, [sel, func]] of Object.entries(CDV_SELECTORS_AND_FUNCTIONS)) {
            const element = $(sel);
            if (element.length > 0) {
                const resultValue = func(element) as never; // type as never nécessaire pour éviter erreur
                result[k as keyof JVCTypes.CDV.Infos] = resultValue;
            }
        }
    
        return result;
    }
}