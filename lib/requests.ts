/**
 * @module requests
 */

import crypto from 'node:crypto';
import { JvcResponseError } from './errors.js';
import { API_DOMAIN, API_VERSION, HTTP_CODES, DEFAULT_REQUEST_RETRIES, SECOND_DELAY, DEFAULT_USER_AGENT, PARTNER_KEY, HMAC_SECRET } from './vars.js';
import { sleep } from './utils.js';
import util from "node:util";
import { exec as srcExec } from "node:child_process";
import { LibTypes } from './types/index.js';

let SESSION: undefined | Record<string, string> = undefined;
let USER_AGENT: string = DEFAULT_USER_AGENT;

/**
 * Renseigne la valeur du cookie `cf_clearance` et du *user-agent* associé afin d'empêcher les services Cloudflare de bloquer les requêtes.
 * Voir plus d'informations [ici](../guides/quickstart.md#contournement-de-cloudflare).
 * 
 * 
 * @param {string} cfClearance valeur du cookie `cf_clearance` 
 * @param {string} userAgent *user-agent*
 */
export function setupCloudflare(cfClearance: string, userAgent: string) {
    SESSION = { "cf_clearance": cfClearance };
    USER_AGENT = userAgent;
}

function normalizeHeaders(headers: Record<string, string>) {
    for (const header in headers) {
        if (headers.hasOwnProperty(header)) {
            const capitalizedHeader = header
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join('-');

            const value = headers[header];
            delete headers[header];

            headers[capitalizedHeader] = value;
        }
    }

    return headers;
}

function authHeader(path: string, method: string = 'GET', query: { [key: string]: any } | null = null): string {
    const date = new Date().toISOString();
    const parsedUrl = new URL(`https://${API_DOMAIN}/v${API_VERSION}/${path}`);

    if (query) {
        const sortedQuery = Object.keys(query).sort().reduce((r: { [k: string]: any }, k: string) => (r[k] = query[k], r), {})
        parsedUrl.search = new URLSearchParams(sortedQuery).toString();
    }

    const stringToHash = [
        PARTNER_KEY,
        date,
        method,
        parsedUrl.host,
        parsedUrl.pathname + (parsedUrl.search ? '' : '\n')
    ];

    if (parsedUrl.search) {
        stringToHash.push(parsedUrl.search.replaceAll("+", "%20").replaceAll("*", "%2A").replaceAll("%7E", "~").substring(1));
    }

    const signature = crypto.createHmac('sha256', HMAC_SECRET)
        .update(stringToHash.join('\n'))
        .digest('hex');

    return `PartnerKey=${PARTNER_KEY}, Signature=${signature}, Timestamp=${date}`;
}


function objectToParams(data: Record<string, any>): URLSearchParams {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
        } else {
            params.append(key, value.toString());
        }
    }

    return params;
}

function objectToFormData(data: Record<string,any>): FormData {
    const formData = new FormData();

    for (const [k,v] of Object.entries(data)) {
        if (v instanceof Array) {
            for (const el of v) {
                formData.append(k, el);
            }
        } else {
            formData.append(k, v.toString());
        }
    }

    return formData;
}

function parseData(data: any, method: LibTypes.Requests.HttpMethod, bodyMode: LibTypes.Requests.BodyMode): LibTypes.Requests.BodyType {
    if (['GET', 'HEAD'].includes(method.toUpperCase())) {
        return undefined;
    }

    let parsedData = undefined;


    switch (bodyMode) {
        case "json":
            parsedData = JSON.stringify(data);
            break;
        case "url":
            parsedData = objectToParams(data);
            break;
        case "form":
            parsedData = objectToFormData(data);
            break;
        case "any":
            parsedData = data;
            break;
    }

    return parsedData;
}

/**
 * Effectue une requête à l'API `v4`, à l'endpoint et avec les options spécifiées, puis renvoie la réponse obtenue.
 * 
 * @param {string} path *endpoint* (chemin relatif) auquel adresser la requête. Exemple : `accounts/login`. La liste des *endpoints* est disponible sur [JVFlux](https://jvflux.fr/Documentation_de_l%27API_Jeuxvideo.com#API_v4).
 * @param {LibTypes.Requests.RequestApiOptions} [options] options permettant de modifier le comportement de la requête
 * @param {LibTypes.Requests.HttpMethod} [options.method] méthode HTTP de la requête (`"GET"` par défaut)
 * @param {Record<string, any>} [options.query] les paramètres URL à passer à la requête, sous forme d'objet associant au paramètre sa valeur
 * @param {LibTypes.Requests.BodyType} [options.data] le corps de la requête (pour méthodes `POST` et `PUT`). Doit être un objet sauf si `bodyMode` vaut `"any"`.
 * @param {"json" | "url" | "form" | "any"} [options.bodyMode] format du corps de la requête : `"json"` pour envoyer un objet (par défaut, `Content-Type: application/json`), `"url"` pour envoyer un objet {@link !URLSearchParams | `URLSearchParams`} (`Content-Type: x-www-form-urlencoded`), `"form"` pour envoyer un objet {@link !FormData | `FormData`} (`Content-Type: multipart/form-data`), `"any"` pour envoyer n'importe quel type de variable. Si `"any"` n'est pas choisi, c'est un objet qui est attendu en tant qu'argument `data` et qui sera automatiquement converti dans le type souhaité avec ajout du *header* approprié. Pour `"any"`, la valeur de `data` sera envoyée telle quelle sans modification et le *header* `Content-Type` sera à renseigner par l'utilisateur
 * @param {Record<string, string>} [options.cookies] les cookies à envoyer sous forme d'objet associant au nom du cookie sa valeur
 * @param {Record<string, string>} [options.headers] les en-têtes à envoyer sous forme d'objet associant au nom de l'en-tête sa valeur
 * @param {number} [options.retries] nombre maximal de tentatives d'envoi de la requête au cas où une erreur `429 Too Many Requests` se produit (par défaut `3`)
 * @param {number} [options.retryDelay] délai entre chaque tentative en millisecondes (par défaut `2 000`)
 * @param {number[]} [options.allowedStatusErrors] contient les statuts HTTP signalant un échec à ignorer, c'est-à-dire ceux qui ne causeront pas l'erreur {@link errors.JvcResponseError | JvcResponseError} si renvoyés. Contient par défaut les statuts 400 (`Bad Request`) et 404 (`Not Found`)
 * @throws {@link errors.JvcResponseError | `JvcResponseError`} si un statut HTTP signalant un échec a été rencontré et qu'il n'est pas listé dans `allowedStatusErrors`
 * 
 * @returns 
 */
export async function requestApi(path: string, { method = 'GET', query = {}, data = undefined, cookies = {}, headers = {}, allowedStatusErrors = [HTTP_CODES.BAD_REQUEST, HTTP_CODES.NOT_FOUND], bodyMode = "json", retries = DEFAULT_REQUEST_RETRIES, retryDelay = 2*SECOND_DELAY }: LibTypes.Args.Requests.RequestApiOptions = {}): Promise<Response> {
    const url = `https://${API_DOMAIN}/v${API_VERSION}/${path}`;
    const jvAuth = authHeader(path, method, query);
    const reqHeaders = {
        ...headers,
        "Jvc-Authorization": jvAuth,
        "Jvc-App-Platform": "Android",
        "Jvc-App-Version": "338",
        "User-Agent": "JeuxVideo-Android/338",
        "Host": API_DOMAIN
    };
        
    return request(url, { method, query, headers: reqHeaders, data, cookies, allowedStatusErrors, bodyMode, curl: false, retries, retryDelay })
}

const exec = util.promisify(srcExec);
const DELIMITER = "-".repeat(6);

// associe à chaque attribut de RawResponse la variable "Write out" associée de cURL
const CURL_RESULT_PARTS: LibTypes.Requests.CurlResults = {
    body: null,
    headers: "header_json",
    status: "response_code",
    url: "url_effective"
};

// associe à chaque attribut de RawResponse ses délimiteurs
const CURL_SCHEME: LibTypes.Requests.CurlScheme = Object.fromEntries(
    Object.keys(CURL_RESULT_PARTS).map(x => [
        x,
        [`${DELIMITER}BEGIN ${x.toUpperCase()}${DELIMITER}`, `${DELIMITER}END ${x.toUpperCase()}${DELIMITER}`]
    ])
) as LibTypes.Requests.CurlScheme;

// associe à chaque attribut de RawResponse une fonction qui parse la chaîne de caractères correspondante obtenue depuis stdout
const PARSE_RESULT_ATTRS: LibTypes.Requests.CurlParsers = {
    "body": (str: string) => str.trim(),
    "headers": (str: string) => {
        const obj: Record<string, string[]> = JSON.parse(str.replace("\n", ""));
        return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v[0]]));
    },
    "status": (str: string) => parseInt(str.trim()),
    "url": (str: string) => str.trim()
};

function convertRequestIntoCurl(request: Request, body: LibTypes.Requests.BodyType): string {
    let command = `echo ${CURL_SCHEME["body"][0]} & `;
    // -X : méthode, -L : suivre redirections, -A : User-Agent, -s : pas de barre de progression
    command += `curl -s -X "${request.method}" -L "${request.url}" -A "${USER_AGENT}"`;

    if (!["GET", "HEAD"].includes(request.method) && body) {
        // -d : body (str)
        if (body instanceof FormData) {
            for (const [k,v] of body.entries()) {
                command += ` -F "${k}=${v}"`;
            }
            request.headers.set("Content-Type", "multipart/form-data");
        } else if (body instanceof URLSearchParams) {
            command += ` -d "${body.toString()}"`;
        } else {
            command += ` -d "${body}"`;
        }
    }

    for (const [key, value] of request.headers.entries()) {
        // -H : header
        command += ` -H "${key}: ${value}"`;
    }

    // ajout de l'option "Write out" pour formater la réponse obtenue
    command += ` -w "\n${CURL_SCHEME["body"][1]}`;
    for (const [attr, varName] of Object.entries(CURL_RESULT_PARTS)) {
        if (!varName) {
            continue;
        }
        command += `\n${CURL_SCHEME[attr as keyof LibTypes.Requests.CurlScheme][0]}\n%{${varName}}\n${CURL_SCHEME[attr as keyof LibTypes.Requests.CurlScheme][1]}`;
    }

    command += "\"";
    return command.replace(/\n/g, "\\n"); // prise en charge des sauts de ligne
}

function convertCurlIntoResponse(stdout: string): Response {
    const responseObj: LibTypes.Requests.CurlRawResponse = {
        body: '',
        headers: {},
        status: 0,
        url: ''
    };

    const lines = stdout.split("\n");
    let i = -1; // curseur parcourant les lignes

    for (const [attr, [_begin, end]] of Object.entries(CURL_SCHEME)) {
        i += 2; // fin de section précédente + début de section actuelle
        const attrValue: string[] = [];

        while (i < lines.length && !lines[i].startsWith(end)) {
            attrValue.push(lines[i]);
            i += 1;
        }

        responseObj[attr as keyof LibTypes.Requests.CurlRawResponse] = PARSE_RESULT_ATTRS[attr as keyof LibTypes.Requests.CurlParsers](attrValue.join("\n")) as never;
    }

    const response = new Response(responseObj.body, { headers: responseObj.headers, status: responseObj.status });
    Object.defineProperty(response, "url", { value: responseObj.url });

    return response;
}

/**
 * Effectue une requête à l'URL passée en entrée et avec les options spécifiées puis renvoie la réponse obtenue.
 * 
 * @param {string | URL} url URL de la requête
 * @param {LibTypes.Requests.RequestOptions} [options] options permettant de modifier le comportement de la requête
 * @param {LibTypes.Requests.HttpMethod} [options.method] méthode HTTP de la requête (`"GET"` par défaut)
 * @param {Record<string, any>} [options.query] les paramètres URL à passer à la requête, sous forme d'objet associant au paramètre sa valeur
 * @param {any} [options.data] le corps de la requête (pour méthodes `POST` et `PUT`). Doit être un objet sauf si `bodyMode` vaut `"any"`.
 * @param {"json" | "url" | "form" | "any"} [options.bodyMode] format du corps de la requête : `"json"` pour envoyer un objet (par défaut, `Content-Type: application/json`), `"url"` pour envoyer un objet {@link !URLSearchParams | `URLSearchParams`} (`Content-Type: x-www-form-urlencoded`), `"form"` pour envoyer un objet {@link !FormData | `FormData`} (`Content-Type: multipart/form-data`), `"any"` pour envoyer n'importe quel type de variable. Si `"any"` n'est pas choisi, c'est un objet qui est attendu en tant qu'argument `data` et qui sera automatiquement converti dans le type souhaité avec ajout du *header* approprié. Pour `"any"`, la valeur de `data` sera envoyée telle quelle sans modification et le *header* `Content-Type` sera à renseigner par l'utilisateur
 * @param {Record<string, string>} [options.cookies] les cookies à envoyer sous forme d'objet associant au nom du cookie sa valeur
 * @param {Record<string, string>} [options.headers] les en-têtes à envoyer sous forme d'objet associant au nom de l'en-tête sa valeur
 * @param {number} [options.retries] nombre maximal de tentatives d'envoi de la requête au cas où une erreur `429 Too Many Requests` se produit (par défaut `3`)
 * @param {number} [options.retryDelay] délai entre chaque tentative en millisecondes (par défaut `2 000`)
 * @param {number[]} [options.allowedStatusErrors] contient les statuts HTTP signalant un échec à ignorer, c'est-à-dire ceux qui ne causeront pas l'erreur {@link errors.JvcResponseError | JvcResponseError} si renvoyés. Contient par défaut les statuts 400 (`Bad Request`) et 404 (`Not Found`)
 * @param {boolean} [options.curl] `true` pour utiliser [`cURL`](https://curl.se/docs/manpage.html) afin de contourner les restrictions Cloudflare des serveurs JVC (nécessite que `cURL` soit installé sur la machine), `false` pour envoyer la requête avec {@link !fetch | `fetch`} (par défaut)
 * @throws {@link errors.JvcResponseError | `JvcResponseError`} si un statut HTTP signalant un échec a été rencontré et qu'il n'est pas listé dans `allowedStatusErrors`
 * 
 * @returns {Promise<Response>}
 */
export async function request(url: string | URL, { method = "GET", query = {}, headers = {}, data = undefined, cookies = {}, allowedStatusErrors = [HTTP_CODES.BAD_REQUEST, HTTP_CODES.NOT_FOUND], bodyMode = "json", curl = false, retries = DEFAULT_REQUEST_RETRIES, retryDelay = 2*SECOND_DELAY }: LibTypes.Args.Requests.RequestOptions = {}): Promise<Response> {
    headers = normalizeHeaders(headers);

    if (SESSION) {
        cookies = { ...cookies, ...SESSION };
    }

    const reqHeaders = new Headers({
        ...headers,
        ...(cookies && { 'Cookie': Object.entries(cookies).map(([key, value]) => `${key}=${value}`).join('; ') })
    });

    const urlObject = new URL(url);
    if (Object.keys(query).length > 0) {
        urlObject.search = new URLSearchParams(query).toString();
    }

    let parsedData = parseData(data, method, bodyMode);

    if (parsedData !== undefined && bodyMode === "json") {
        reqHeaders.set("Content-Type", "application/json");
    }

    const options: RequestInit = {
        method,
        headers: reqHeaders,
        body: parsedData
    };

    let response: Response = new Response();
    let currentTry = 0;
    while (currentTry < retries) {
        currentTry += 1;

        if (curl) {
            response = await curlRequest(urlObject, options);
        } else {
            response = await fetch(urlObject, options);
        }

        if (response.status !== HTTP_CODES.TOO_MANY_REQUESTS || allowedStatusErrors.includes(HTTP_CODES.TOO_MANY_REQUESTS)) {
            break;
        }

        await sleep(retryDelay);
    }


    if (!response.ok && !allowedStatusErrors.includes(response.status)) {
        if (response.status === HTTP_CODES.FORBIDDEN) {
            throw new JvcResponseError(`Unexpected status code signalling a request failure: ${response.status}.\nL'erreur renvoyée est une erreur 403 Forbidden, ce qui signifie généralement que les services Cloudflare ont bloqué votre requête à JVC. Pour empêcher cela d'advenir, faites appel à la fonction setupCloudflare dont l'usage est expliqué dans la section « Démarrage rapide » de la documentation.`);
        } else {
            throw new JvcResponseError(`Unexpected status code signalling a request failure: ${response.status}.`);
        }
    }

    return response;
}

async function curlRequest(url: URL, options: RequestInit): Promise<Response> {
    const requestObject = new Request(url, options);
    const command = convertRequestIntoCurl(requestObject, options.body);
    
    const { stdout, stderr } = await exec(command);
    if (stderr) {
        throw new Error(`Call to cURL failed: ${stderr}. Is cURL installed on the machine?`);
    }
    
    const response = convertCurlIntoResponse(stdout);
    return response;
}