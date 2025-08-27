import { expect, describe, test } from "vitest";
import { ID_TYPE, machineId, profileDescription, profileParams, profileParamsToSet } from "./vars.js";
import Client from "../classes/Client.js";
import Profile from "../classes/Profile.js";
import { NotConnected } from "../errors.js";
import { getFirstValueOfAsyncGenerator, testArray } from "./utils.js";
import Forum from "../classes/Forum.js";
import Topic from "../classes/Topic.js";
import Game from "../classes/Game.js";
import { readFileSync } from "node:fs";
import Post from "../classes/Post.js";


let favoriteTopics: Set<number>;
let favoriteForums: Set<number>;
let favoriteGames: Set<number>;
let currentTopics: Set<number>;
let currentGames: Set<number>;
let currentForums: Set<number>;
let avatarUrl: string;
let description: string;

describe("getInfos", () => {
    test("standard", async () => {
        const infos = await global.profile.getInfos();
        expect(infos).toMatchObject(ID_TYPE);
        avatarUrl = infos.avatarUrl;
        description = infos.description ? infos.description.raw : "";
    });

    test("with not connected client", async () => {
        const p = new Profile(new Client());
        await expect(p.getInfos()).rejects.toThrowError(NotConnected);
    });
});

describe("getPage", () => {
    test("standard", async () => {
        const infos = await global.profile.getPage();
        expect(infos).toMatchObject({ reviews: expect.any(Object) });
    });

    test("with not connected client", async () => {
        const p = new Profile(new Client());
        await expect(p.getPage()).rejects.toThrowError(NotConnected);
    });
});

describe("getFavoriteForums", () => {
    test("on existent account", async () => {
        const result = await global.profile.getFavoriteForums();
        testArray(result, Forum);

        favoriteForums = new Set(result.map(f => f.id));
        currentForums = new Set(favoriteForums);
    });
    
    test("raw on existent account", async () => {
        const result = await global.profile.getFavoriteForums({ raw: true });
        expect(result).toMatchObject({ items: expect.anything() });
    });

    test("with not connected client", async () => {
        const p = new Profile(new Client());
        await expect(p.getFavoriteForums()).rejects.toThrowError(NotConnected);
    });
});

describe("getFavoriteTopics", () => {
    test("on existent account", async () => {
        const result = await global.profile.getFavoriteTopics();
        testArray(result, Topic);

        favoriteTopics = new Set(result.map(t => t.id));
        currentTopics = new Set(favoriteTopics);
    });
    
    test("raw on existent account", async () => {
        const result = await global.profile.getFavoriteTopics({ raw: true });
        expect(result).toMatchObject({ items: expect.anything() });
    });

    test("with not connected client", async () => {
        const p = new Profile(new Client());
        await expect(p.getFavoriteTopics()).rejects.toThrowError(NotConnected);
    });
});

describe("getFavoriteGames", () => {
    test("on existent account", async () => {
        const result = await global.profile.getFavoriteGames();
        testArray(result, Game);

        favoriteGames = new Set(result.map(t => t.id));
        currentGames = new Set(favoriteGames);
    });
    
    test("raw on existent account", async () => {
        const result = await global.profile.getFavoriteGames({ raw: true });
        expect(result).toMatchObject({ items: expect.anything() });
    });

    test("with not connected client", async () => {
        const p = new Profile(new Client());
        await expect(p.getFavoriteGames()).rejects.toThrowError(NotConnected);
    });
});

describe("editFavoriteForums", () => {
    test("add", async () => {
        const result = await global.profile.editFavoriteForums([...favoriteForums], { mode: "add" });
        favoriteForums.forEach(f => currentForums.add(f));
        expect(new Set(result.map(f => f.id))).toStrictEqual(currentForums);
    });

    test("remove", async () => {
        const forumToRemove = [...favoriteForums][0];
        const result = await global.profile.editFavoriteForums([forumToRemove], { mode: "remove" });
        currentForums.delete(forumToRemove);
        expect(new Set(result.map(f => f.id))).toStrictEqual(currentForums);
    });

    test("update", async () => {
        const result = await global.profile.editFavoriteForums([...favoriteForums], { mode: "update" });
        expect(new Set(result.map(f => f.id))).toStrictEqual(favoriteForums);
    });

    test("with not connected client", async () => {
        const p = new Profile(new Client());
        await expect(p.editFavoriteForums([])).rejects.toThrowError(NotConnected);
    });
});

describe("editFavoriteTopics", () => {
    test("add", async () => {
        const result = await global.profile.editFavoriteTopics([...favoriteTopics], { mode: "add" });
        favoriteTopics.forEach(t => currentTopics.add(t));
        expect(new Set(result.map(t => t.id))).toStrictEqual(currentTopics);
    });

    test("remove", async () => {
        const topicToRemove = [...favoriteTopics][0];
        const result = await global.profile.editFavoriteTopics([topicToRemove], { mode: "remove" });
        currentTopics.delete(topicToRemove);
        expect(new Set(result.map(t => t.id))).toStrictEqual(currentTopics);
    });

    test("update", async () => {
        const result = await global.profile.editFavoriteTopics([...favoriteTopics], { mode: "update" });
        expect(new Set(result.map(t => t.id))).toStrictEqual(favoriteTopics);
    });

    test("with not connected client", async () => {
        const p = new Profile(new Client());
        await expect(p.editFavoriteTopics([])).rejects.toThrowError(NotConnected);
    });
});

describe("editFavoriteGames", () => {
    test("add", async () => {
        const gamesToAdd = [...favoriteGames].map(id => { return { id, machine: machineId }});
        gamesToAdd.forEach(g => currentGames.add(g.id));
        const result = await global.profile.editFavoriteGames(gamesToAdd, { mode: "add" });
        expect(new Set(result.map(g => g.id))).toStrictEqual(currentGames);
    });

    test("remove", async () => {
        const gameToRemove = [...favoriteGames][0];
        const result = await global.profile.editFavoriteGames([{ id: gameToRemove, machine: machineId }], { mode: "remove" });
        currentGames.delete(gameToRemove);
        expect(new Set(result.map(g => g.id))).toStrictEqual(currentGames);
    });

    test("update", async () => {
        const result = await global.profile.editFavoriteGames([...favoriteGames].map(id => { return { id, machine: machineId }}), { mode: "update" });
        expect(new Set(result.map(g => g.id))).toStrictEqual(favoriteGames);
    });

    test("with not connected client", async () => {
        const p = new Profile(new Client());
        await expect(p.editFavoriteGames([])).rejects.toThrowError(NotConnected);
    });
});

describe("setAvatar", () => {
    test("with local file", async () => {
        await global.profile.setAvatar(process.env.PICTURE!);
        const infos = await global.profile.getInfos();

        expect(infos.avatarUrl).not.toBe(avatarUrl);
    });

    test("with buffer", async () => {
        const result = await global.profile.setAvatar(readFileSync(process.env.PICTURE!));
        expect(result).toBe(undefined);
    });

    test("with URL", async () => {
        const result = await global.profile.setAvatar(new URL(process.env.PICTURE_URL!));
        expect(result).toBe(undefined);
    });

    test("with not connected client", async () => {
        const p = new Profile(new Client());
        await expect(p.setAvatar("")).rejects.toThrowError(NotConnected);
    });
});

describe("setDescription", () => {
    test("standard", async () => {
        await global.profile.setDescription(profileDescription);
        const infos = await global.profile.getInfos();
        expect(infos.description.raw).toBe(profileDescription);

        await global.profile.setDescription(description);
    });

    test("with not connected client", async () => {
        const p = new Profile(new Client());
        await expect(p.setDescription("")).rejects.toThrowError(NotConnected);
    });
});

describe("getForumPosts", () => {
    test("standard", async () => {
        const posts = global.profile.getForumPosts();
        expect(await getFirstValueOfAsyncGenerator(posts)).toBeInstanceOf(Post);
    });

    test("with not connected client", async () => {
        const p = new Profile(new Client());
        const posts = p.getForumPosts();
        await expect(getFirstValueOfAsyncGenerator(posts)).rejects.toThrowError(NotConnected);
    });
});

describe("getParams", () => {
    test("standard", async () => {
        const params = await global.profile.getParams();
        expect(params).toMatchObject(profileParams);
    });

    test("with not connected client", async () => {
        const p = new Profile(new Client());
        await expect(p.getParams()).rejects.toThrowError(NotConnected);
    });
});

describe("setParams", () => {
    test("standard", async () => {
        await global.profile.setParams(profileParamsToSet);
        const params = await global.profile.getParams();
        expect(params).toMatchObject(profileParamsToSet);
        await global.profile.setParams(profileParams);
    });

    test("with not connected client", async () => {
        const p = new Profile(new Client());
        await expect(p.setParams(profileParamsToSet)).rejects.toThrowError(NotConnected);
    });
});

describe("setSignature", () => {
    test("standard", async () => {
        await global.profile.setSignature(profileParamsToSet.signature);
        const params = await global.profile.getParams();
        expect(params.signature).toBe(profileParamsToSet.signature);
        await global.profile.setSignature(profileParams.signature);
    });

    test("with not connected client", async () => {
        const p = new Profile(new Client());
        await expect(p.setSignature(profileParamsToSet.signature)).rejects.toThrowError(NotConnected);
    });
});

describe("isLevelLimitReached", () => {
    test("standard on topics", async () => {
        const reached = await global.profile.isLevelLimitReached({ mode: "topic" });
        expect(reached).toBe(false);
    });

    test("standard on posts", async () => {
        const reached = await global.profile.isLevelLimitReached({ mode: "post" });
        expect(reached).toBe(false);
    });

    test("with not connected client", async () => {
        const p = new Profile(new Client());
        await expect(p.isLevelLimitReached()).rejects.toThrowError(NotConnected);
    });
});