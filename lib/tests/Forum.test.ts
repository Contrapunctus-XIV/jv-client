import { expect, describe, test } from "vitest";
import { NonexistentContent } from "../errors.js";
import { getFirstValueOfAsyncGenerator, testArray } from "./utils.js";
import Topic from "../classes/Topic.js";
import { forum, forumApiUrl, forumTitle, forumUrl, ID_TYPE, nonexistentForum, researchTopic } from "./vars.js";

describe("doesForumExist", () => {
    test("on existent forum", async () => {
        const existence = await forum.doesForumExist();
        expect(existence).toBe(true);
    });

    test("on nonexistent forum", async () => {
        const existence = await nonexistentForum.doesForumExist();
        expect(existence).toBe(false);
    });
});

describe("getForumTitle", () => {
    test("standard", async () => {
        const title = await forum.getForumTitle();
        expect(title).toBe(forumTitle);
    });

    test("on nonexistent forum", async () => {
        await expect(nonexistentForum.getForumTitle()).rejects.toThrowError(NonexistentContent);
    });
});

describe("getStandardURL", () => {
    test("standard", async () => {
        const url = await forum.getStandardURL();
        expect(url).toBe(forumUrl);
    });
    
    test("api on existent forum", async () => {
        const url = await forum.getStandardURL({ api: true });
        expect(url).toBe(forumApiUrl);
    });

    test("on nonexistent forum", async () => {
        await expect(nonexistentForum.getStandardURL()).rejects.toThrowError(NonexistentContent);
    });
});

describe("readTopics", () => {
    test("standard", async () => {
        const topics = forum.readTopics();
        testArray(await getFirstValueOfAsyncGenerator(topics), Topic);
    });

    test("promise & raw on existent forum", async () => {
        const topics = await forum.readTopics({ raw: true, page: 1 });
        testArray(topics, ID_TYPE);
    });

    test("on nonexistent forum", async () => {
        await expect(getFirstValueOfAsyncGenerator(nonexistentForum.readTopics())).rejects.toThrowError(NonexistentContent);
    });
});

describe("searchTopics", () => {
    test("standard", async () => {
        const topics = forum.searchTopics(researchTopic);
        testArray(await getFirstValueOfAsyncGenerator(topics), Topic);
    });

    test("promise & raw on existent forum", async () => {
        const topics = await forum.searchTopics(researchTopic, { raw: true, page: 1 });
        testArray(topics, ID_TYPE);
    });

    test("on nonexistent forum", async () => {
        await expect(getFirstValueOfAsyncGenerator(nonexistentForum.searchTopics(researchTopic))).rejects.toThrowError(NonexistentContent);
    });
});

// Forum.listen