import { expect, describe, test } from "vitest";
import { NonexistentContent } from "../errors.js";
import { getFirstValueOfAsyncGenerator, testArray } from "./utils.js";
import Post from "../classes/Post.js";
import { ID_TYPE, nonexistentTopic, topic, topicApiUrl, topicFirstPostId, topicForumId, topicToScrape, topicToScrapeInfos, topicUrl } from "./vars.js";

describe("doesTopicExist", () => {
    test("on existent topic", async () => {
        const existence = await topic.doesTopicExist();
        expect(existence).toBe(true);
    });

    test("on nonexistent topic", async () => {
        const existence = await nonexistentTopic.doesTopicExist();
        expect(existence).toBe(false);
    });
});

describe("getInfos", () => {
    test("standard", async () => {
        const infos = await topicToScrape.getInfos();
        const newInfos = {
            ...infos,
            publicationDate: infos.publicationDate.toISOString(),
            lastAnswerDate: infos.lastAnswerDate.toISOString()
        };
        expect(newInfos).toStrictEqual(topicToScrapeInfos);
    });

    test("on nonexistent topic", async () => {
        await expect(nonexistentTopic.getInfos()).rejects.toThrowError(NonexistentContent);
    });
});

describe("getForum", () => {
    test("standard", async () => {
        const forum = await topic.getForum();
        expect(forum.id).toBe(topicForumId);
    });

    test("on nonexistent topic", async () => {
        await expect(nonexistentTopic.getForum()).rejects.toThrowError(NonexistentContent);
    });
});

describe("getStandardURL", () => {
    test("standard", async () => {
        const url = await topic.getStandardURL();
        expect(url).toBe(topicUrl);
    });

    test("api", async () => {
        const url = await topic.getStandardURL({ api: true });
        expect(url).toBe(topicApiUrl);
    });

    test("on nonexistent topic", async () => {
        await expect(nonexistentTopic.getStandardURL()).rejects.toThrowError(NonexistentContent);
    });
});

describe("getConnected", () => {
    test("standard", async () => {
        const connected = await topic.getConnected();
        expect(connected).toBeGreaterThanOrEqual(0);
    });

    test("on nonexistent topic", async () => {
        await expect(nonexistentTopic.getConnected()).rejects.toThrowError(NonexistentContent);
    });
});

describe("read", () => {
    test("standard", async () => {
        const posts = topic.read();
        testArray(await getFirstValueOfAsyncGenerator(posts), Post);
    });

    test("raw & promise", async () => {
        const posts = await topic.read({ page: 1, raw: true });
        testArray(posts, ID_TYPE);
    });

    test("on nonexistent topic", async () => {
        await expect(getFirstValueOfAsyncGenerator(nonexistentTopic.read())).rejects.toThrowError(NonexistentContent);
    });
});

describe("getFirstPost", () => {
    test("standard", async () => {
        const firstPost = await topic.getFirstPost();
        expect(firstPost.id).toBe(topicFirstPostId);
    });

    test("on nonexistent topic", async () => {
        await expect(nonexistentTopic.getFirstPost()).rejects.toThrowError(NonexistentContent);
    });
});

