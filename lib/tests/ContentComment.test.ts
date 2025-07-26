import { describe, expect, test } from "vitest";
import ContentComment from "../classes/ContentComment.js";
import { comment, ID_TYPE, nonexistentComment } from "./vars.js";
import { NonexistentContent } from "../errors.js";
import { testArray } from "./utils.js";

describe("doesCommentExist", () => {
    test("on existent comment", async () => {
        const existence = await comment.doesCommentExist();
        expect(existence).toBe(true);
    });

    test("on nonexistent comment", async () => {
        const existence = await nonexistentComment.doesCommentExist();
        expect(existence).toBe(false);
    });
});

describe("getInfos", () => {
    test("standard", async () => {
        const infos = await comment.getInfos();
        expect(infos.id).toBe(comment.id);
    });

    test("on nonexistent comment", async () => {
        await expect(nonexistentComment.getInfos()).rejects.toThrowError(NonexistentContent);
    });
});

describe("getAnswers", () => {
    test("standard", async () => {
        const answers = await comment.getAnswers();
        testArray(answers, ContentComment);
    });

    test("raw on existent comment", async () => {
        const answers = await comment.getAnswers({ raw: true });
        testArray(answers.items, ID_TYPE);
    });

    test("on nonexistent comment", async () => {
        const answers = await nonexistentComment.getAnswers();
        expect(answers).toStrictEqual([]);
    });
});