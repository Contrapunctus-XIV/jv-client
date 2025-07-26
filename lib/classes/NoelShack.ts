/**
 * @module classes
 */

import { request } from "../requests.js";
import { readFileSync } from "node:fs";
import { DOMAIN_URL, MOSAIC_VALUES, NOELSHACK_UPLOAD_FILE_URL, NOELSHACK_UPLOAD_FROM_URL, SECOND_DELAY } from "../vars.js";
import { JvcErrorMessage, ValueError } from "../errors.js";
import { JVCTypes } from "../types/index.js";
import sharp from "sharp";
import { sleep } from "../utils.js";

export default abstract class NoelShack {
    private static detectError(data: any) {
        return Array.isArray(data.erreurs);
    }

    private static async sendBlob(blob: Blob, filename: string): Promise<JVCTypes.NoelShack.UploadInfos> {
        const formData = new FormData();
        formData.append("fichier[]", blob, filename);
        formData.append("domain", DOMAIN_URL);

        const response = await request(NOELSHACK_UPLOAD_FILE_URL, {
            method: "POST",
            data: formData,
            bodyMode: "any",
            retries: 10
        });

        const data = await response.json();
        if (NoelShack.detectError(data)) {
            throw new JvcErrorMessage(data.erreurs.join(" "));
        }

        return data;
    }

    private static async sendURL(url: URL) {
        const response = await request(NOELSHACK_UPLOAD_FROM_URL, { query: { url: url.toString(), domain: DOMAIN_URL, callback: "JSONPcallbackNoelshack" }});
        const data = await response.text();
        const regex = /{[^{}]*(?:{[^{}]*}[^{}]*)*}/;
        const dataJSON = JSON.parse(data.match(regex)![0]);

        if (NoelShack.detectError(dataJSON)) {
            throw new JvcErrorMessage(dataJSON.erreurs.join(" "));
        }

        return dataJSON;
    }

    /**
     * Téléverse le fichier passé en entrée sur [NoelShack](https://www.noelshack.com/) et renvoie un objet contenant l'URL obtenue.
     * 
     * @param {string | URL | Buffer} file l'image à téléverser. Peut être un chemin pointant vers le fichier (`string`), une URL (objet {@link !URL | `URL`}) ou un `Buffer`
     * @throws {@link !Error | `Error`} si le fichier n'existe pas
     * @throws {@link errors.JvcErrorMessage | `JvcErrorMessage`} si le téléversement a échoué (fichier invalide)
     * @returns 
     */
    static async upload(file: string | URL | Buffer): Promise<JVCTypes.NoelShack.UploadInfos> {
        if (file instanceof URL) {
            return NoelShack.sendURL(file);
        }

        let buffer;
        let filename;

        if (typeof file === "string") {
            buffer = readFileSync(file);
            filename = file.split("/").pop()!;
        } else {
            buffer = file;
            filename = Math.random().toString(36).slice(2, 8)
        }

        const blob = new Blob([buffer]);
        
        return NoelShack.sendBlob(blob, filename);
    }

    /**
     * Réalise une mosaïque du fichier passé en entrée, la téléverse sur [NoelShack](https://www.noelshack.com/) puis renvoie le texte permettant de l'afficher sur JVC.
     * Le téléversement peut prendre plusieurs minutes étant donné la limite de requêtes imposée par NoelShack.
     * 
     * @param {string | URL | Buffer} file l'image à téléverser. Peut être un chemin pointant vers le fichier (`string`), une URL (objet {@link !URL | `URL`}) ou un `Buffer`
     * @param {{ cols?: number, rows?: number }} [options] dimensions de la mosaïque. Si elles ne sont pas spécifiées, des dimensions optimales sont automatiquement calculées en fonction de l'image
     * @param {number} [options.cols] nombre de colonnes (maximum `8`)
     * @param {number} [options.rows] nombre de lignes (maximum `10`)
     * @throws {@link !Error | `Error`} si le fichier n'existe pas
     * @throws {@link errors.JvcErrorMessage | `JvcErrorMessage`} si le téléversement a échoué (fichier invalide)
     * @throws {@link errors.ValueError | `ValueError`} si les dimensions spécifiées sont invalides
     * @returns 
     */
    static async uploadMosaic(file: string | URL | Buffer, { cols = undefined, rows = undefined }: { cols?: number, rows?: number } = {}): Promise<string> {
        if (cols && (cols <= 0 || cols > MOSAIC_VALUES.maxCols) || rows && (rows <= 0 || rows > MOSAIC_VALUES.maxRows)) {
            throw new ValueError(`cols argument must be between 0 and ${MOSAIC_VALUES.maxCols}; rows argument must be between 0 and ${MOSAIC_VALUES.maxRows}.`);
        }

        if (file instanceof URL) {
            const bufferRequest = await request(file);
            file = Buffer.from(await bufferRequest.arrayBuffer());
        }
        
        const image = sharp(file);
        let newWidth;
        let newHeight;

        if (cols && rows) {
            newWidth = MOSAIC_VALUES.tileWidth * cols;
            newHeight = MOSAIC_VALUES.tileHeight * rows;
        } else {
            const metadata = await image.metadata();
            cols = Math.ceil(2 * metadata.width / MOSAIC_VALUES.tileWidth);
            rows = Math.ceil(2 * metadata.height / MOSAIC_VALUES.tileHeight);
    
            cols = cols == 0 ? 1 : cols > MOSAIC_VALUES.maxCols ? MOSAIC_VALUES.maxCols : cols;
            rows = rows == 0 ? 1 : rows > MOSAIC_VALUES.maxRows ? MOSAIC_VALUES.maxRows : rows;

            newWidth = MOSAIC_VALUES.tileWidth * cols;
            newHeight = MOSAIC_VALUES.tileHeight * rows;
        }

        image.resize(newWidth, newHeight, { fit: "fill" });
        const gridBlobs = new Array(rows);

        for (let row = 0; row < rows; row++) {
            gridBlobs[row] = [];
            
            for (let col = 0; col < cols; col++) {
                const left = col * MOSAIC_VALUES.tileWidth;
                const top = row * MOSAIC_VALUES.tileHeight;
    
                const cellBuffer = await image
                    .extract({ left, top, width: MOSAIC_VALUES.tileWidth, height: MOSAIC_VALUES.tileHeight })
                    .toBuffer();
    
                gridBlobs[row].push(new Blob([cellBuffer]));
            }
        }

        const mosaicId = Math.random().toString(36).slice(2, 8);
        const result = new Array(rows);
        for (let row = 0; row < rows; row++) {
            result[row] = [];

            for (let col = 0; col < cols; col++) {
                const index = row * cols + col;
                const filename = `${index.toString().padStart(2, "0")}-${mosaicId}.png`;
                const data = await NoelShack.sendBlob(gridBlobs[row][col], filename);

                result[row][col] = data;
                await sleep(SECOND_DELAY);
            }
        }

        return result.map(row => row.map((data: JVCTypes.NoelShack.UploadInfos) => data.url).join(" ")).join("\n");
    }
}