import { expect, describe, test } from "vitest";
import JVCode from "../scrapers/JVCode.js";
import { testMarkup, testMessage, qTestMessage } from "./vars.js";

describe("htmlToJvCode", () => {
    test("standard", () => {
        const result = JVCode.htmlToJVCode(testMarkup, { replaceQTags: true });
        expect(result).toBe(testMessage);
    });

    test("without replacing <q>", () => {
        const result = JVCode.htmlToJVCode(testMarkup, { replaceQTags: false });
        expect(result).toBe(qTestMessage);
    });
});