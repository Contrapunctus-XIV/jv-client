import crypto from 'node:crypto';
import { JvcResponseError } from './errors.js';
import { API_DOMAIN, API_VERSION, GG_DOMAIN, HTTP_CODES, MAX_REQUEST_RETRIES, SECOND_DELAY, USER_AGENT } from './vars.js';
import { sleep } from './utils.js';
import util from "node:util";
import { exec as srcExec } from "node:child_process";

const PARTNER_KEY = '550c04bf5cb2b';
const HMAC_SECRET = 'd84e9e5f191ea4ffc39c22d11c77dd6c';

interface CallOptions {
    method?: string;
    query?: Record<string, any>;
    data?: any;
    cookies?: Record<string, string>;
    headers?: Record<string, string>;
    allowedStatusErrors?: number[];
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

export async function callApi(path: string, { method = 'GET', query = {}, data = {}, cookies = {}, headers = {}, allowedStatusErrors = [HTTP_CODES.BAD_REQUEST, HTTP_CODES.NOT_FOUND] }: CallOptions = {}): Promise<Response> {
    const url = new URL(`https://${API_DOMAIN}/v${API_VERSION}/${path}`);
    if (Object.keys(query).length > 0) {
        url.search = new URLSearchParams(query).toString();
    }

    headers = normalizeHeaders(headers);

    const jvAuth = authHeader(path, method, query);
    const reqHeaders = {
        ...headers,
        "jvc-authorization": jvAuth,
        "content-type": headers['content-type'] || 'application/json',
        "jvc-app-platform": "Android",
        "jvc-app-version": "338",
        "user-agent": "JeuxVideo-Android/338",
        "host": API_DOMAIN,
        ...(cookies && { 'cookie': Object.entries(cookies).map(([key, value]) => `${key}=${value}`).join('; ') })
    };

    let parsedData = undefined;

    if (!['GET', 'HEAD'].includes(method.toUpperCase())) {
        if (reqHeaders['content-type'] === 'application/json') {
            parsedData = JSON.stringify(data);
        } else if (reqHeaders['content-type'] === 'application/x-www-form-urlencoded') {
            parsedData = buildDataAsParams(data);
        } else {
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

export async function callGG(path: string, { method = 'GET', query = {}, data = {}, cookies = {}, headers = {}, allowedStatusErrors = [HTTP_CODES.BAD_REQUEST, HTTP_CODES.NOT_FOUND] }: CallOptions = {}): Promise<Response> {
    const url = new URL(`https://${GG_DOMAIN}/${path}`);
    headers = normalizeHeaders(headers);

    const reqHeaders = {
        ...headers,
        "content-type": headers['content-type'] || 'application/json',
        "user-agent": USER_AGENT,
        ...(cookies && { 'cookie': Object.entries(cookies).map(([key, value]) => `${key}=${value}`).join('; ') })
    };

    let parsedData = undefined;
    if (!['GET', 'HEAD'].includes(method.toUpperCase())) {
        if (reqHeaders['content-type'] === 'application/json') {
            parsedData = JSON.stringify(data);
        } else if (reqHeaders['content-type'] === 'application/x-www-form-urlencoded') {
            parsedData = buildDataAsParams(data);
        } else {
            parsedData = data;
        }
    }

    const urlWithParams = new URL(url);
    if (Object.keys(query).length > 0) {
        urlWithParams.search = new URLSearchParams(query).toString();
    }

    const options: RequestInit = {
        method,
        headers: reqHeaders,
        body: parsedData && method !== 'GET' ? parsedData : undefined,
    };

    try {
        const parsedUrl = urlWithParams.toString();
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

// les attributs qui sont obtenus après parsing de la sortie de cURL
interface RawResponse {
    body: string;
    headers: Record<string, string>;
    status: number;
    url: string;
};

type Parsers = {
    [K in keyof RawResponse]: (str: string) => RawResponse[K];
};
type Curl_Scheme = { [K in keyof RawResponse]: [string, string] };

const DELIMITER = "-".repeat(6);

// associe à chaque attribut de RawResponse la variable "Write out" associée de cURL
const CURL_RESULT_PARTS: { [K in keyof RawResponse]: string | null } = {
    body: null,
    headers: "header_json",
    status: "response_code",
    url: "url_effective"
};

// associe à chaque attribut de RawResponse ses délimiteurs
const CURL_SCHEME: Curl_Scheme = Object.fromEntries(
    Object.keys(CURL_RESULT_PARTS).map(x => [
        x,
        [`${DELIMITER}BEGIN ${x.toUpperCase()}${DELIMITER}`, `${DELIMITER}END ${x.toUpperCase()}${DELIMITER}`]
    ])
) as Curl_Scheme;

// associe à chaque attribut de RawResponse une fonction qui parse la chaîne de caractères correspondante obtenue depuis stdout
const PARSE_RESULT_ATTRS: Parsers = {
    "body": (str: string) => str.trim(),
    "headers": (str: string) => {
        const obj: Record<string, string[]> = JSON.parse(str.replace("\n", ""));
        return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v[0]]));
    },
    "status": (str: string) => parseInt(str.trim()),
    "url": (str: string) => str.trim()
};

function convertRequestIntoCurl(request: Request, { body = undefined }: { body?: string } = {}): string {
    let command = `echo ${CURL_SCHEME["body"][0]} & `;
    // -X : méthode, -L : suivre redirections, -A : User-Agent, -s : pas de barre de progression
    command += `curl -s -X "${request.method}" -L "${request.url}" -A "${USER_AGENT}"`;

    for (const [key, value] of request.headers.entries()) {
        // -H : header
        command += ` -H "${key}: ${value}"`;
    }

    if (!["GET", "HEAD"].includes(request.method) && body) {
        // -d : body (str)
        command += ` -d "${body}"`;
    }

    // ajout de l'option "Write out" pour formater la réponse obtenue
    command += ` -w "\n${CURL_SCHEME["body"][1]}`;
    for (const [attr, varName] of Object.entries(CURL_RESULT_PARTS)) {
        if (!varName) {
            continue;
        }
        command += `\n${CURL_SCHEME[attr as keyof Curl_Scheme][0]}\n%{${varName}}\n${CURL_SCHEME[attr as keyof Curl_Scheme][1]}`;
    }

    command += "\"";
    return command.replace(/\n/g, "\\n"); // prise en charge des sauts de ligne
}

function convertCurlIntoResponse(stdout: string): Response {
    const responseObj: RawResponse = {
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

        responseObj[attr as keyof RawResponse] = PARSE_RESULT_ATTRS[attr as keyof Parsers](attrValue.join("\n")) as never;
    }

    const response = new Response(responseObj.body, { headers: responseObj.headers, status: responseObj.status });
    Object.defineProperty(response, "url", { value: responseObj.url });

    return response;
}

export async function curl(url: string, { method = "GET", query = {}, headers = {}, data = undefined, cookies = {}, allowedStatusErrors = [HTTP_CODES.BAD_REQUEST, HTTP_CODES.NOT_FOUND] }: CallOptions = {}): Promise<Response> {
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

    let parsedData: string | undefined = undefined;

    if (!['GET', 'HEAD'].includes(method.toUpperCase())) {
        if (reqHeaders.get('Content-Type') === 'application/json') {
            parsedData = JSON.stringify(data);
        } else if (reqHeaders.get('Content-Type') === 'application/x-www-form-urlencoded') {
            parsedData = buildDataAsParams(data);
        } else {
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