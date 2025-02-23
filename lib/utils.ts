/**
 * @module utils
 */

import * as fs from 'fs';
import { EMOJI_REGEX, VALID_JVC_CHARACTERS, FRENCH_MONTHS_TO_NUMBER, SELECTORS, INTEGER_LIMIT } from './vars.js';

/**
 * @hidden
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * @hidden
 */
export function readFileAsBytes(filePath: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, { encoding: null }, (err: any, data: any) => {
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    });
}

/**
 * @hidden
 */
export function uniformize_string(_str: string): string {
    return _str.toLowerCase().trim();
}

/**
 * @hidden
 */
function findInvalidChar(str: string, validChars: Array<string>): boolean {
    for (const char of str) {
        if (!validChars.includes(char)) {
            return true;
        }
    }

    return false;
}

/**
 * Renvoie `true` si le texte est postable dans les forums de JVC, `false` sinon.
 * 
 * @param text texte à traiter
 * @param { minimumLength?: number, checkForInvalidChar?: boolean } [options]
 * @param {number} [options.minimumLength] nombre minimal de caractères accepté, par défaut 3
 * @param {boolean} [options.checkForInvalidChar] `true` pour vérifier si le texte comporte des caractères invalides (par défaut), `false` sinon
 * @returns {boolean}
 */
export function isValidJVCText(text: string, { minimumLength = 3, checkForInvalidChar = true }: { minimumLength?: number, checkForInvalidChar?: boolean } = {}): boolean {
    const lettersAndDigits = /[A-Za-z0-9]/;
    if (!lettersAndDigits.test(text)) {
        return false;
    }

    if (text.length < minimumLength) {
        return false;
    }

    if (checkForInvalidChar) {
        const res = findInvalidChar(text.replace(EMOJI_REGEX, ''), VALID_JVC_CHARACTERS);
        if (res) {
            return false;
        }
    }

    return true;
}

/**
 * Renvoie une date correspondant à la chaîne de caractères passée en entrée, au format "01 janvier 2001 à 00:00:01" ou "01 janvier 2001", que l'on trouve
 * dans les forums de JVC en en-tête des messages.
 * Renvoie `undefined` si la chaîne de caractères ne correspond pas à une date valide.
 * 
 * @param {string} dateString la date
 * @returns {Date | undefined}
 */
export function convertJVCStringToDate(dateString: string): Date | undefined {
    const regexWithTime = /(\d{2}) ([\p{L}']+) (\d{4}) à (\d{2}):(\d{2}):(\d{2})/u;
    const regexWithoutTime = /(\d{2}) ([\p{L}']+) (\d{4})/u;

    let match = dateString.match(regexWithTime);
    if (!match) {
        match = dateString.match(regexWithoutTime);
    }

    if (match) {
        const day = parseInt(match[1], 10);
        const month = FRENCH_MONTHS_TO_NUMBER[match[2] as keyof typeof FRENCH_MONTHS_TO_NUMBER];
        const year = parseInt(match[3], 10);
        const hours = match[4] ? parseInt(match[4], 10) : 0;
        const minutes = match[5] ? parseInt(match[5], 10) : 0;
        const seconds = match[6] ? parseInt(match[6], 10) : 0;

        const dateUTC = new Date(Date.UTC(year, month, day, hours, minutes, seconds));

        const options = { timeZone: 'Europe/Paris' };
        const frenchDate = new Date(dateUTC.toLocaleString('en-US', options));

        return frenchDate;
    }

    return undefined;
}

/**
 * Renvoie un lien obtenu après décodage du JvCare passée en entrée.
 * Les JvCare sont un mécanisme d'obfusquation développé par JVC et destiné à masquer les liens situés sur une page HTML obtenue après une requête
 * effectuée avec une API comme `fetch`.
 * 
 * @example
 * ```ts
 * console.log(decodeJvCare("JvCare 1F4943CCC24843CBCB43C11F"));
 * ```
 * 
 * @param elementClass classe de l'élément, qui contient le JvCare
 * @returns {string}
 */
export function decodeJvCare(elementClass: string): string {
    const base16 = '0A12B34C56D78E9F';
    let link = '';
    const s = elementClass.split(' ')[1];
    for (let i = 0; i < s.length; i += 2) {
        link += String.fromCharCode(base16.indexOf(s.charAt(i)) * 16 + base16.indexOf(s.charAt(i + 1)));
    }
    return link;
}

/**
 * @hidden
 */
export function decodeAllJvCares($: cheerio.Root): cheerio.Root {
    $(SELECTORS["jvCare"])
        .each((index: number, element: cheerio.Element) => {
            const className = $(element).attr('class');
            if (className) {
                const link = decodeJvCare(className);
                $(element).attr('href', link);
            }
        });

    return $;
}

/**
 * @hidden
 */
export function checkInteger(nb: number) {
    if (nb >= INTEGER_LIMIT) {
        throw new Error(`Value ${nb} is too big for PostgreSQL's Integer (maximum: ${INTEGER_LIMIT - 1}).`);
    }
}