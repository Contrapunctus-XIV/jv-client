import { expect, describe, test } from "vitest";
import { NonexistentContent } from "../errors.js";
import { review, nonexistentReview } from "./vars.js";

describe("doesReviewExist", () => {
    test("on existent review", async () => {
        const existence = await review.doesReviewExist();
        expect(existence).toBe(true);
    });

    test("on nonexistent review", async () => {
        const existence = await nonexistentReview.doesReviewExist();
        expect(existence).toBe(false);
    });
});

describe("getInfos", () => {
    test("standard", async () => {
        const infos = await review.getInfos();
        expect(infos.id).toBe(review.id);
    });

    test("on nonexistent review", async () => {
        await expect(nonexistentReview.getInfos()).rejects.toThrowError(NonexistentContent);
    });
});