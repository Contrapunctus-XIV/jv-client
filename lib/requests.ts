/**
 * @module requests
 */

import crypto from 'node:crypto';
import { JvcResponseError } from './errors.js';
import { API_DOMAIN, API_VERSION, HTTP_CODES, MAX_REQUEST_RETRIES, SECOND_DELAY, USER_AGENT } from './vars.js';
import { sleep } from './utils.js';
import util from "node:util";
import { exec as srcExec } from "node:child_process";
import { LibTypes } from './types/index.js';

const PARTNER_KEY = '550c04bf5cb2b';
const HMAC_SECRET = 'd84e9e5f191ea4ffc39c22d11c77dd6c';

function normalizeHeaders(headers: Record<string, string>) {
    for (const header in headers) {
        if (headers.hasOwnProperty(header)) {
            const capitalizedHeader = header
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join('-');

            const value = headers[header];
            delete headers[header];

            headers[capitalizedHeader] = value.toLowerCase();
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


function buildDataAsParams(data: Record<string, any>): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
        } else {
            params.append(key, value.toString());
        }
    }

    return params.toString();
}

/**
 * Effectue une requête à l'API `v4`, à l'endpoint et avec les options spécifiées, puis renvoie la réponse obtenue.
 * 
 * @param {string} path *endpoint* (chemin relatif) auquel adresser la requête. Exemple : `accounts/login`. La liste des *endpoints* est disponible sur [JVFlux](https://jvflux.fr/Documentation_de_l%27API_Jeuxvideo.com#API_v4).
 * @param {LibTypes.Requests.Options} [options] options permettant de modifier le comportement de la requête
 * @param {LibTypes.Requests.HttpMethod} [options.method] méthode HTTP de la requête (`GET` par défaut)
 * @param {Record<string, any>} [options.query] les paramètres URL à passer à la requête, sous forme d'objet associant au paramètre sa valeur
 * @param {any} [options.data] le corps de la requête (pour méthodes `POST` et `PUT`). Son format est arbitraire est dépend du header `Content-Type` fourni : `application/json` (header par défaut), `application/x-www-form-urlencoded` et `multipart/form-data` recquièrent tous un objet. Pour tout autre header tel que `application/octet-stream`, la valeur de ce paramètre sera passée telle que donnée par l'utilisateur à la requête
 * @param {Record<string, string>} [options.cookies] les cookies à envoyer sous forme d'objet associant au nom du cookie sa valeur
 * @param {Record<string, string>} [options.headers] les en-têtes à envoyer sous forme d'objet associant au nom de l'en-tête sa valeur. Une en-tête particulièrement importante est `Content-Type` car elle déterminera la manière dont sera traitée le paramètre optionnel `data` (voir ci-dessus)
 * @param {number[]} [options.allowedStatusErrors] contient les statuts HTTP signalant un échec à ignorer, c'est-à-dire ceux qui ne causeront pas l'erreur {@link errors.JvcResponseError | JvcResponseError} si renvoyés. Contient par défaut les statuts 400 (`Bad Request`) et 404 (`Not Found`)
 * @throws {@link errors.JvcResponseError | JvcResponseError} si un statut HTTP signalant un échec a été rencontré et qu'il n'est pas listé dans `allowedStatusErrors`
 * 
 */
export async function callApi(path: string, { method = 'GET', query = {}, data = undefined, cookies = {}, headers = {}, allowedStatusErrors = [HTTP_CODES.BAD_REQUEST, HTTP_CODES.NOT_FOUND] }: { method?: LibTypes.Requests.HttpMethod; query?: Record<string, any>; data?: any; cookies?: Record<string, string>; headers?: Record<string, string>; allowedStatusErrors?: number[] } = {}): Promise<Response> {
    const url = new URL(`https://${API_DOMAIN}/v${API_VERSION}/${path}`);
    if (Object.keys(query).length > 0) {
        url.search = new URLSearchParams(query).toString();
    }

    headers = normalizeHeaders(headers);

    const jvAuth = authHeader(path, method, query);
    const reqHeaders = new Headers({
        ...headers,
        "Jvc-Authorization": jvAuth,
        "Content-Type": headers['content-type'] || 'application/json',
        "Jvc-App-Platform": "Android",
        "Jvc-App-Version": "338",
        "User-Agent": "JeuxVideo-Android/338",
        "Host": API_DOMAIN,
        ...(cookies && { 'cookie': Object.entries(cookies).map(([key, value]) => `${key}=${value}`).join('; ') })
    });

    let parsedData = undefined;

    if (!['GET', 'HEAD'].includes(method.toUpperCase())) {
        if (reqHeaders.get('Content-Type') === 'application/json') {
            parsedData = JSON.stringify(data);
        } else if (reqHeaders.get('Content-Type') === 'application/x-www-form-urlencoded') {
            parsedData = buildDataAsParams(data);
        } else if (reqHeaders.get('Content-Type') === "multipart/form-data") {
            parsedData = convertObjToFormData(data);
        }
        else {
            parsedData = data;
        }
    }

    const options: RequestInit = {
        method,
        headers: reqHeaders,
        body: parsedData,
    };

    try {
        const parsedUrl = url.toString();
        const response = await fetch(parsedUrl, options);

        if (!response.ok && !allowedStatusErrors.includes(response.status)) {
            throw new JvcResponseError(`Unexpected status code signalling a request failure: ${response.status}.`);
        }

        return response;
    } catch (error) {
        throw error;
    }
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

function convertRequestIntoCurl(request: Request, { body = undefined }: { body?: string | FormData } = {}): string {
    let command = `echo ${CURL_SCHEME["body"][0]} & `;
    // -X : méthode, -L : suivre redirections, -A : User-Agent, -s : pas de barre de progression
    command += `curl -s -X "${request.method}" -L "${request.url}" -A "${USER_AGENT}"`;

    if (!["GET", "HEAD"].includes(request.method) && body) {
        // -d : body (str)
        if (body instanceof FormData) {
            for (const [k,v] of body.entries()) {
                command += ` -F "${k}=${v}"`;
            }
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

function convertObjToFormData(data: Record<string,any>): FormData {
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

/**
 * Effectue une requête à l'URL passée en entrée et avec les options spécifiées puis renvoie la réponse obtenue.
 * Utilise [`cURL`](https://curl.se/docs/manpage.html) afin de contourner les restrictions Cloudflare des serveurs JVC.
 * 
 * @param {string} url URL de la requête
 * @param {LibTypes.Requests.Options} [options] options permettant de modifier le comportement de la requête
 * @param {LibTypes.Requests.HttpMethod} [options.method] méthode HTTP de la requête (`GET` par défaut)
 * @param {Record<string, any>} [options.query] les paramètres URL à passer à la requête, sous forme d'objet associant au paramètre sa valeur
 * @param {any} [options.data] le corps de la requête (pour méthodes `POST` et `PUT`). Son format est arbitraire est dépend du header `Content-Type` fourni : `application/json` (header par défaut), `application/x-www-form-urlencoded` et `multipart/form-data` recquièrent tous un objet. Pour tout autre header tel que `application/octet-stream`, la valeur de ce paramètre sera passée telle que donnée par l'utilisateur à la requête
 * @param {Record<string, string>} [options.cookies] les cookies à envoyer sous forme d'objet associant au nom du cookie sa valeur
 * @param {Record<string, string>} [options.headers] les en-têtes à envoyer sous forme d'objet associant au nom de l'en-tête sa valeur. Une en-tête particulièrement importante est `Content-Type` car elle déterminera la manière dont sera traitée le paramètre optionnel `data` (voir ci-dessus)
 * @param {number[]} [options.allowedStatusErrors] contient les statuts HTTP signalant un échec à ignorer, c'est-à-dire ceux qui ne causeront pas l'erreur {@link errors.JvcResponseError | JvcResponseError} si renvoyés. Contient par défaut les statuts 400 (`Bad Request`) et 404 (`Not Found`)
 * @throws {@link errors.JvcResponseError | JvcResponseError} si un statut HTTP signalant un échec a été rencontré et qu'il n'est pas listé dans `allowedStatusErrors`
 * 
 * @returns {Promise<Response>}
 */
export async function curl(url: string, { method = "GET", query = {}, headers = {}, data = undefined, cookies = {}, allowedStatusErrors = [HTTP_CODES.BAD_REQUEST, HTTP_CODES.NOT_FOUND] }: { method?: LibTypes.Requests.HttpMethod; query?: Record<string, any>; data?: any; cookies?: Record<string, string>; headers?: Record<string, string>; allowedStatusErrors?: number[] } = {}): Promise<Response> {
    headers = normalizeHeaders(headers);

    const reqHeaders = new Headers({
        ...headers,
        "Content-Type": headers['Content-Type'] || 'application/json',
        ...(cookies && { 'Cookie': Object.entries(cookies).map(([key, value]) => `${key}=${value}`).join('; ') })
    });

    const urlWithParams = new URL(url);
    if (Object.keys(query).length > 0) {
        urlWithParams.search = new URLSearchParams(query).toString();
    }

    let parsedData: string | FormData | undefined = undefined;

    if (!['GET', 'HEAD'].includes(method.toUpperCase())) {
        if (reqHeaders.get('Content-Type') === 'application/json') {
            parsedData = JSON.stringify(data);
        } else if (reqHeaders.get('Content-Type') === 'application/x-www-form-urlencoded') {
            parsedData = buildDataAsParams(data);
        } else if (reqHeaders.get('Content-Type') === "multipart/form-data") {
            parsedData = convertObjToFormData(data);
        }
        else {
            parsedData = data;
        }
    }

    const request: Request = new Request(urlWithParams, {
        method,
        headers: reqHeaders
    });

    const command = convertRequestIntoCurl(request, { body: parsedData });
    let response: Response;
    let retries = 0;

    while (true) {
        const { stdout, stderr } = await exec(command);
        if (stderr) {
            throw new Error(`Call to cURL failed: ${stderr}`);
        }

        response = convertCurlIntoResponse(stdout);

        if (response.status !== HTTP_CODES.TOO_MANY_REQUESTS || retries > MAX_REQUEST_RETRIES) { // Too Many Request
            break;
        }

        await sleep(SECOND_DELAY)
        retries += 1
    }

    if (!response.ok && !allowedStatusErrors.includes(response.status)) {
        throw new JvcResponseError(`Unexpected status code signalling a request failure: ${response.status}.`);
    }

    return response;
}