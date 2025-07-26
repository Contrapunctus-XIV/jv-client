import { expect, describe, test } from "vitest";
import { NonexistentContent } from "../errors.js";
import { getFirstValueOfAsyncGenerator, testArray } from "./utils.js";
import Content, { Video } from "../classes/Content.js";
import { game, ID_TYPE, nonexistentGame, machineId } from "./vars.js";
import Review from "../classes/Review.js";

describe("doesGameExist", () => {
    test("on existent game", async () => {
        const existence = await game.doesGameExist();
        expect(existence).toBe(true);
    });

    test("on nonexistent game", async () => {
        const existence = await nonexistentGame.doesGameExist();
        expect(existence).toBe(false);
    });
});

describe("getInfos", () => {
    test("standard", async () => {
        const infos = await game.getInfos();
        expect(infos.id).toBe(game.id);
    });

    test("with machine ID", async () => {
        const infos = await game.getInfos({ machineId });
        expect(infos.id).toBe(game.id);
    })

    test("on nonexistent game", async () => {
        await expect(nonexistentGame.getInfos()).rejects.toThrowError(NonexistentContent);
    });
});

describe("getDetails", () => {
    test("standard", async () => {
        const details = await game.getDetails();
        expect(details).toMatchObject({ content: expect.any(String) });
    });

    test("with machine ID", async () => {
        const details = await game.getDetails({ machineId });
        expect(details).toMatchObject({ content: expect.any(String) });
    })

    test("on nonexistent game", async () => {
        await expect(nonexistentGame.getDetails()).rejects.toThrowError(NonexistentContent);
    });
});

describe("getLightInfos", () => {
    test("standard", async () => {
        const infos = await game.getLightInfos();
        expect(infos.id).toBe(game.id);
    });

    test("with machine ID", async () => {
        const infos = await game.getLightInfos({ machineId });
        expect(infos.id).toBe(game.id);
    })

    test("on nonexistent game", async () => {
        await expect(nonexistentGame.getLightInfos()).rejects.toThrowError(NonexistentContent);
    });
});

describe("getImages", () => {
    test("standard", async () => {
        const images = await game.getImages();
        testArray(images.items, { imageUrl: expect.any(String) }); 
    });

    test("with machine ID", async () => {
        const images = await game.getImages({ machineId });
        testArray(images.items, { imageUrl: expect.any(String) }); 
    })

    test("on nonexistent game", async () => {
        await expect(nonexistentGame.getImages()).rejects.toThrowError(NonexistentContent);
    });
});

describe("getReviewsStats", () => {
    test("standard", async () => {
        const stats = await game.getReviewsStats();
        testArray(stats, { userReviewAverage: expect.any(Number) });
    });

    test("on nonexistent game", async () => {
        await expect(nonexistentGame.getReviewsStats()).rejects.toThrowError(NonexistentContent);
    });
});

describe("getNews", () => {
    test("standard", async () => {
        const news = game.getNews();
        testArray(await getFirstValueOfAsyncGenerator(news), Content);
    });

    test("with machine ID", async () => {
        const news = game.getNews({ machineId });
        testArray(await getFirstValueOfAsyncGenerator(news), Content);
    });

    test("with raw & promise", async () => {
        const news = await game.getNews({ page: 1, raw: true });
        testArray(news.items, ID_TYPE);
    });

    test("on nonexistent game", async () => {
        await expect(getFirstValueOfAsyncGenerator(nonexistentGame.getNews())).rejects.toThrowError(NonexistentContent);
    });
});

describe("getReviews", () => {
    test("standard", async () => {
        const reviews = game.getReviews(machineId);
        testArray(await getFirstValueOfAsyncGenerator(reviews), Review);
    });

    test("with raw & promise", async () => {
        const reviews = await game.getReviews(machineId, { page: 1, raw: true });
        testArray(reviews.items, ID_TYPE);
    });

    test("on nonexistent game", async () => {
        await expect(getFirstValueOfAsyncGenerator(nonexistentGame.getReviews(machineId))).rejects.toThrowError(NonexistentContent);
    });
});

describe("getVideos", () => {
    test("standard", async () => {
        const videos = game.getVideos();
        testArray(await getFirstValueOfAsyncGenerator(videos), Video);
    });

    test("with machine ID", async () => {
        const videos = game.getVideos({ machineId });
        testArray(await getFirstValueOfAsyncGenerator(videos), Video);
    });

    test("with raw & promise", async () => {
        const videos = await game.getVideos({ page: 1, raw: true });
        testArray(videos.items, ID_TYPE);
    });

    test("on nonexistent game", async () => {
        await expect(getFirstValueOfAsyncGenerator(nonexistentGame.getVideos())).rejects.toThrowError(NonexistentContent);
    });
});

describe("getWikis", () => {
    test("standard", async () => {
        const wikis = game.getWikis();
        testArray(await getFirstValueOfAsyncGenerator(wikis), Content);
    });

    test("with machine ID", async () => {
        const wikis = game.getWikis({ machineId });
        testArray(await getFirstValueOfAsyncGenerator(wikis), Content);
    });

    test("with raw & promise", async () => {
        const wikis = await game.getWikis({ page: 1, raw: true });
        testArray(wikis.items, ID_TYPE);
    });

    test("on nonexistent game", async () => {
        await expect(getFirstValueOfAsyncGenerator(nonexistentGame.getWikis())).rejects.toThrowError(NonexistentContent);
    });
});