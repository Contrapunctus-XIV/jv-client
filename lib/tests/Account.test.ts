import { NonexistentContent } from "../errors.js";
import { expect, describe, test } from 'vitest';
import { account, bannedAccount, nonexistentAccount } from "./vars.js";
import { testArray } from "./utils.js";
import Forum from "../classes/Forum.js";
import Topic from "../classes/Topic.js";
import Game from "../classes/Game.js";

describe("doesAccountExist", () => {
    test("on existent account", async () => {
        const existence = await account.doesAccountExist();
        expect(existence).toBe(true);
    });
    
    test("on unexisting account", async () => {
        const existence = await nonexistentAccount.doesAccountExist();
        expect(existence).toBe(false);
    });
});

describe("getInfos", () => {
    test("standard", async () => {
        const infos = await account.getInfos();
        expect(infos.id).toBe(account.id);
    });
    
    test("on unexisting account", async () => {
        await expect(nonexistentAccount.getInfos()).rejects.toThrowError(NonexistentContent);
    });
});

describe("getPage", () => {
    test("standard", async () => {
        const page = await account.getPage();
        expect(page).toMatchObject({ reviews: expect.any(Array) });
    });
    
    test("raw on existent account", async () => {
        const page = await account.getPage({ raw: true });
        expect(page).toMatchObject({ reviews: expect.anything() });
    });
    
    test("on unexisting account", async () => {
        await expect(nonexistentAccount.getPage()).rejects.toThrowError(NonexistentContent);
    });
});

describe("getFavoriteForums", () => {
    test("standard", async () => {
        const favorites = await account.getFavoriteForums();
        testArray(favorites, Forum);
    });
    
    test("raw on existent account", async () => {
        const favorites = await account.getFavoriteForums({ raw: true });
        expect(favorites).toMatchObject({ items: expect.anything() });
    });
    
    test("on nonexistent account", async () => {
        await expect(nonexistentAccount.getFavoriteForums()).rejects.toThrowError(NonexistentContent);
    });
});

describe("getFavoriteTopics", () => {
    test("standard", async () => {
        const favorites = await account.getFavoriteTopics();
        testArray(favorites, Topic);
    });
    
    test("raw on existent account", async () => {
        const favorites = await account.getFavoriteTopics({ raw: true });
        expect(favorites).toMatchObject({ items: expect.anything() });
    });
    
    test("on nonexistent account", async () => {
        await expect(nonexistentAccount.getFavoriteTopics()).rejects.toThrowError(NonexistentContent);
    });
});

describe("getFavoriteGames", () => {
    test("standard", async () => {
        const favorites = await account.getFavoriteGames();
        testArray(favorites, Game);
    });
    
    test("raw on existent account", async () => {
        const favorites = await account.getFavoriteGames({ raw: true });
        expect(favorites).toMatchObject({ items: expect.anything() });
    });
    
    test("on nonexistent account", async () => {
        await expect(nonexistentAccount.getFavoriteGames()).rejects.toThrowError(NonexistentContent);
    });
});

describe("isBanned", () => {
    test("on banned account", async () => {
        const isBanned = await bannedAccount.isBanned();
        expect(isBanned).toBe(true);
    });
    
    test("on unbanned account", async () => {
        const isBanned = await account.isBanned();
        expect(isBanned).toBe(false);
    });
    
    test("on nonexistent account", async () => {
        await expect(nonexistentAccount.isBanned()).rejects.toThrowError(NonexistentContent);
    });
})