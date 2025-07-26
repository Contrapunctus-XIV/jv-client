import { expect, test, describe } from 'vitest';
import { NonexistentContent, NotConnected } from "../errors.js";
import Client from "../classes/Client.js";
import { alias, nonexistentAlias, bannedAlias, aliasId } from "./vars.js";

describe("doesAliasExist", () => {
    test("on existent alias", async () => {
        const existence = await alias.doesAliasExist();
        expect(existence).toBe(true);
    });
    
    test("on unexisting alias", async () => {
        const existence = await nonexistentAlias.doesAliasExist();
        expect(existence).toBe(false);
    });
});

describe("isBanned", () => {
    test("on banned alias", async () => {
        const isBanned = await bannedAlias.isBanned();
        expect(isBanned).toBe(true);
    });
    
    test("on unbanned alias", async () => {
        const isBanned = await alias.isBanned();
        expect(isBanned).toBe(false);
    });
    
    test("on nonexistent alias", async () => {
        await expect(nonexistentAlias.isBanned()).rejects.toThrowError(NonexistentContent);
    });
});

describe("getInfos", () => {
    test("standard", async () => {
        const infos = await alias.getInfos();
        expect(infos.alias).toBe(alias.alias);
    });
    
    test("on nonexistent alias", async () => {
        await expect(nonexistentAlias.getInfos()).rejects.toThrowError(NonexistentContent);
    });
});

describe("getID", () => {
    test("standard", async () => {
        const id = await alias.getID(global.client);
        expect(id).toBe(aliasId);
    });
    
    test("on unexisting alias", async () => {
        await expect(nonexistentAlias.getID(global.client)).rejects.toThrowError(NonexistentContent);
    });
    
    test("with not connected client", async () => {
        const c = new Client();
        await expect(alias.getID(c)).rejects.toThrowError(NotConnected);
    });
});