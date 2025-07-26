import { expect, describe, test } from "vitest";
import { NonexistentContent, JvcErrorMessage, NotConnected } from "../errors.js";
import ForumClient from "../classes/ForumClient.js";
import Topic from "../classes/Topic.js";
import Client from "../classes/Client.js";
import Post from "../classes/Post.js";
import { sleep } from "../utils.js";
import { testForum, nonexistentForum, nonexistentTopic, nonexistentPost, topic, post as thirdPartyPost, delayBetweenPosts, lockReason, topicTitle, topicMessage, message } from "./vars.js";

let newTopic: Topic;
let newPost: Post;

describe("postTopic", () => {
    test("with existing forum", async () => {
        newTopic = await global.forumClient.postTopic(testForum, topicTitle, topicMessage);
        expect(newTopic).toBeInstanceOf(Topic);
    });

    test("with nonexistent forum", async () => {
        await expect(global.forumClient.postTopic(nonexistentForum, topicTitle, topicMessage)).rejects.toThrowError(NonexistentContent);
    });

    test("with not connected client", async () => {
        const fc = new ForumClient(new Client());
        await expect(fc.postTopic(nonexistentForum, topicTitle, topicMessage)).rejects.toThrowError(NotConnected);
    });
});

describe("postMessage", () => {
    test("standard", async () => {
        await sleep(delayBetweenPosts);

        newPost = await global.forumClient.postMessage(newTopic, message);
        expect(newPost).toBeInstanceOf(Post);
    });

    test("with nonexistent topic", async () => {
        await expect(global.forumClient.postMessage(nonexistentTopic, message)).rejects.toThrowError(NonexistentContent);
    });

    test("with not connected client", async () => {
        const fc = new ForumClient(new Client());
        await expect(fc.postMessage(nonexistentTopic, message)).rejects.toThrowError(NotConnected);
    });
});

describe("up", async () => {
    test("standard", async () => {
        await sleep(delayBetweenPosts);
        const callback = async (post: Post) => {
            const infos = await post.getInfos(global.client); 
            expect(infos.id).toBe(post.id);
            await global.forumClient.deletePost(post);
            global.forumClient.stopUp();
        };

        await global.forumClient.up(newTopic, message, { callback });
    });

    test("with nonexistent topic", async () => {
        await expect(global.forumClient.up(nonexistentTopic, message)).rejects.toThrowError(NonexistentContent);
    });

    test("with not connected client", async () => {
        const fc = new ForumClient(new Client());
        await expect(fc.up(newTopic, message)).rejects.toThrowError(NotConnected);
    });
});

describe("deletePost", () => {
    test("standard", async () => {
        await global.forumClient.deletePost(newPost);
        expect(await newPost.doesPostExist(global.client)).toBe(false);
    });

    test("with nonexistent post", async () => {
        await expect(global.forumClient.deletePost(nonexistentPost)).rejects.toThrowError(NonexistentContent);
    });

    test("with not connected client", async () => {
        const fc = new ForumClient(new Client());
        await expect(fc.deletePost(nonexistentPost)).rejects.toThrowError(NotConnected);
    });

    test("with invalid post", async () => {
        await expect(global.forumClient.deletePost(thirdPartyPost)).rejects.toThrowError(JvcErrorMessage);
    });
});

describe("toggleTopicResolution", () => {
    test("standard", async () => {
        const result = await global.forumClient.toggleTopicResolution(newTopic);
        expect(result).toBe(undefined);
    });

    test("with nonexistent topic", async () => {
        await expect(global.forumClient.toggleTopicResolution(nonexistentTopic)).rejects.toThrowError(NonexistentContent);
    });

    test("with not connected client", async () => {
        const fc = new ForumClient(new Client());
        await expect(fc.toggleTopicResolution(nonexistentTopic)).rejects.toThrowError(NotConnected);
    });

    test("with invalid topic", async () => {
        await expect(global.forumClient.toggleTopicResolution(topic)).rejects.toThrowError(JvcErrorMessage);
    });
});

describe("lockTopic", () => {
    test("standard", async () => {
        const result = await global.forumClient.lockTopic(newTopic, lockReason);
        expect(result).toBe(undefined);
    });

    test("with nonexistent topic", async () => {
        await expect(global.forumClient.lockTopic(nonexistentTopic, lockReason)).rejects.toThrowError(NonexistentContent);
    });

    test("with not connected client", async () => {
        const fc = new ForumClient(new Client());
        await expect(fc.lockTopic(nonexistentTopic, lockReason)).rejects.toThrowError(NotConnected);
    });

    test("with invalid topic", async () => {
        await expect(global.forumClient.lockTopic(topic, lockReason)).rejects.toThrowError(JvcErrorMessage);
    });
});

describe("deleteTopic", () => {
    test("standard", async () => {
        await global.forumClient.deleteTopic(newTopic);
        expect(await newTopic.doesTopicExist()).toBe(false);
    });

    test("with nonexistent topic", async () => {
        await expect(global.forumClient.deleteTopic(nonexistentTopic)).rejects.toThrowError(NonexistentContent);
    });

    test("with not connected client", async () => {
        const fc = new ForumClient(new Client());
        await expect(fc.deleteTopic(nonexistentTopic)).rejects.toThrowError(NotConnected);
    });

    test("with invalid topic", async () => {
        await expect(global.forumClient.deleteTopic(topic)).rejects.toThrowError(JvcErrorMessage);
    });
});