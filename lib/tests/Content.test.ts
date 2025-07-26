import Content, { Video } from "../classes/Content.js";
import { expect, test, describe } from 'vitest';
import { NonexistentContent } from "../errors.js";
import ContentComment from "../classes/ContentComment.js";
import { getFirstValueOfAsyncGenerator, testArray } from "./utils.js";
import { content, ID_TYPE, nonexistentContent, wikiContent } from "./vars.js";

describe("doesContentExist", () => {
    test("on existent content", async () => {
        const existence = await content.doesContentExist();
        expect(existence).toBe(true);
    });
    
    test("on nonexistent content", async () => {
        const existence = await nonexistentContent.doesContentExist();
        expect(existence).toBe(false);
    });
});

describe("getInfos", () => {
    test("standard", async () => {
        const infos = await content.getInfos();
        expect(infos.id).toBe(content.id);
    });
    
    test("on nonexistent content", async () => {
        await expect(nonexistentContent.getInfos()).rejects.toThrowError(NonexistentContent);
    });    
});

describe("getComments", () => {
    test("standard", async () => {
        const comments = content.getComments();
        testArray(await getFirstValueOfAsyncGenerator(comments), ContentComment);
    });

    test("raw & promise on existent content", async () => {
        const comments = await content.getComments({ raw: true, page: 1 });
        testArray(comments.items, ID_TYPE);
    });

    test("on nonexistent content", async () => {
        await expect(getFirstValueOfAsyncGenerator(nonexistentContent.getComments())).rejects.toThrowError(NonexistentContent);
    });
});

describe("getRelatedNews", () => {
    test("standard", async () => {
        const news = content.getRelatedNews();
        testArray(await getFirstValueOfAsyncGenerator(news), Content);
    });

    test("raw & promise on existent content", async () => {
        const news = await content.getRelatedNews({ raw: true, page: 1 });
        testArray(news.items, ID_TYPE);
    });

    test("on nonexistent content", async () => {
        await expect(getFirstValueOfAsyncGenerator(nonexistentContent.getRelatedNews())).rejects.toThrowError(NonexistentContent);
    });
});

describe("getRelatedVideos", () => {
    test("standard", async () => {
        const videos = content.getRelatedVideos();
        testArray(await getFirstValueOfAsyncGenerator(videos), Video);
    });

    test("raw & promise on existent content", async () => {
        const videos = await content.getRelatedVideos({ raw: true, page: 1 });
        testArray(videos.items, ID_TYPE);
    });

    test("on nonexistent content", async () => {
        await expect(getFirstValueOfAsyncGenerator(nonexistentContent.getRelatedVideos())).rejects.toThrowError(NonexistentContent);
    });
});

describe("getRelatedWikis", () => {
    test("standard", async () => {
        const wikis = wikiContent.getRelatedWikis();
        testArray(await getFirstValueOfAsyncGenerator(wikis), Content);
    });

    test("raw & promise on existent content", async () => {
        const wikis = await wikiContent.getRelatedWikis({ raw: true, page: 1 });
        testArray(wikis.items, ID_TYPE);
    });

    test("on nonexistent content", async () => {
        await expect(getFirstValueOfAsyncGenerator(nonexistentContent.getRelatedWikis())).rejects.toThrowError(NonexistentContent);
    });
});