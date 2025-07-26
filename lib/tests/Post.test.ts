import { expect, describe, test } from "vitest";
import Client from "../classes/Client.js";
import { NonexistentContent, NotConnected } from "../errors.js";
import { nonexistentPost, post, postToScrape, postToScrapeInfos } from "./vars.js";

describe("doesPostExist", () => {
    test("on existent post", async () => {
        const existence = await post.doesPostExist(global.client);
        expect(existence).toBe(true);
    });

    test("on nonexistent post", async () => {
        const existence = await nonexistentPost.doesPostExist(global.client);
        expect(existence).toBe(false);
    });

    test("with not connected client", async () => {
        await expect(post.doesPostExist(new Client())).rejects.toThrowError(NotConnected);
    });
});

describe("getInfos", () => {
    test("standard", async () => {
        const infos = await postToScrape.getInfos(global.client);
        const newInfos = {
            ...infos,
            date: infos.date.toISOString()
        }
        expect(newInfos).toStrictEqual(postToScrapeInfos);
    });

    test("on nonexistent post", async () => {
        await expect(nonexistentPost.getInfos(global.client)).rejects.toThrowError(NonexistentContent);
    });

    test("with not connected client", async () => {
        await expect(post.getInfos(new Client())).rejects.toThrowError(NotConnected);
    });
});