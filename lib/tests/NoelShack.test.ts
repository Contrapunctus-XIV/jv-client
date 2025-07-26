import { expect, describe, test } from "vitest";
import NoelShack from "../classes/NoelShack.js";
import { sleep } from "../utils.js";
import { readFileSync } from "node:fs";
import { delayBetweenUploads } from "./vars.js";

let url: URL;

describe("upload", () => {
    test("with local file", async () => {
        const result = await NoelShack.upload(process.env.PICTURE!);
        expect(result).toMatchObject({ url: expect.any(String) });
        url = new URL(result.url);
    });

    test("with URL", async () => {
        await sleep(delayBetweenUploads);
        const result = await NoelShack.upload(url);
        expect(result).toMatchObject({ url: expect.any(String) });
    });

    test("with buffer", async () => {
        await sleep(delayBetweenUploads);
        const result = await NoelShack.upload(readFileSync(process.env.PICTURE!));
        expect(result).toMatchObject({ url: expect.any(String) });
    });
});

describe("uploadMosaic", () => {
    test("with local file", async () => {
        await sleep(delayBetweenUploads);
        const result = await NoelShack.uploadMosaic(process.env.PICTURE!, { cols: 1, rows: 1 });
        expect(result).toBeTypeOf("string");
    });

    test("with URL", async () => {
        await sleep(delayBetweenUploads);
        const result = await NoelShack.uploadMosaic(url, { cols: 1, rows: 1 });
        expect(result).toBeTypeOf("string");
    });

    test("with buffer", async () => {
        await sleep(delayBetweenUploads);
        const result = await NoelShack.uploadMosaic(readFileSync(process.env.PICTURE!), { cols: 1, rows: 1 });
        expect(result).toBeTypeOf("string");
    });
});