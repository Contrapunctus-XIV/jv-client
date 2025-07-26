import { describe, test } from "vitest";
import V4 from "../scrapers/V4.js";
import { getFirstValueOfAsyncGenerator, testArray } from "./utils.js";
import Content, { Video } from "../classes/Content.js";
import { ID_TYPE, searchString } from "./vars.js";
import Game from "../classes/Game.js";

describe("getContents", () => {
    test("standard", async () => {
        const contents = V4.getContents();
        testArray(await getFirstValueOfAsyncGenerator(contents), Content);
    });

    test("raw & promise", async () => {
        const contents = await V4.getContents({ page: 1, raw: true });
        testArray(contents.items, ID_TYPE);
    });
});

describe("getHighTechContents", () => {
    test("standard", async () => {
        const contents = V4.getHighTechContents();
        testArray((await getFirstValueOfAsyncGenerator(contents))!.news, ID_TYPE);
    });

    test("raw & promise", async () => {
        const contents = await V4.getHighTechContents({ page: 1, raw: true });
        testArray(contents.news, ID_TYPE);
    });
});

describe("getTrendingContents", () => {
    test("standard", async () => {
        const contents = V4.getTrendingContents();
        testArray(await getFirstValueOfAsyncGenerator(contents), Content);
    });

    test("raw & promise", async () => {
        const contents = await V4.getTrendingContents({ page: 1, raw: true });
        testArray(contents.items, ID_TYPE);
    });
});

describe("getGamesSummary", () => {
    test("standard", async () => {
        const summary = await V4.getGamesSummary();
        testArray(summary.reviews, Content);
    });

    test("raw", async () => {
        const summary = await V4.getGamesSummary({ raw: true });
        testArray(summary.reviews.items, ID_TYPE);
    });
});

describe("getGames", () => {
    test("standard", async () => {
        const games = V4.getGames();
        testArray(await getFirstValueOfAsyncGenerator(games), Game);
    });

    test("raw & promise", async () => {
        const games = await V4.getGames({ page: 1, raw: true });
        testArray(games.items, ID_TYPE);
    });
});

describe("getGamesReleases", () => {
    test("standard", async () => {
        const games = V4.getGamesReleases();
        testArray(await getFirstValueOfAsyncGenerator(games), Game);
    });

    test("raw & promise", async () => {
        const games = await V4.getGamesReleases({ page: 1, raw: true });
        testArray(games.items, ID_TYPE);
    });
});

describe("searchArticles", () => {
    test("standard", async () => {
        const articles = V4.searchArticles(searchString);
        testArray(await getFirstValueOfAsyncGenerator(articles), Content);
    });

    test("raw & promise", async () => {
        const articles = await V4.searchArticles(searchString, { page: 1, raw: true });
        testArray(articles.items, ID_TYPE);
    });
});

describe("searchGames", () => {
    test("standard", async () => {
        const games = V4.searchGames(searchString);
        testArray(await getFirstValueOfAsyncGenerator(games), Game);
    });

    test("raw & promise", async () => {
        const games = await V4.searchGames(searchString, { page: 1, raw: true });
        testArray(games.items, ID_TYPE);
    });
});

describe("searchNews", () => {
    test("standard", async () => {
        const news = V4.searchNews(searchString);
        testArray(await getFirstValueOfAsyncGenerator(news), Content);
    });

    test("raw & promise", async () => {
        const news = await V4.searchNews(searchString, { page: 1, raw: true });
        testArray(news.items, ID_TYPE);
    });
});

describe("searchVideos", () => {
    test("standard", async () => {
        const videos = V4.searchVideos(searchString);
        testArray(await getFirstValueOfAsyncGenerator(videos), Video);
    });

    test("raw & promise", async () => {
        const videos = await V4.searchVideos(searchString, { page: 1, raw: true });
        testArray(videos.items, ID_TYPE);
    });
});

describe("searchWikis", () => {
    test("standard", async () => {
        const wikis = V4.searchWikis(searchString);
        testArray(await getFirstValueOfAsyncGenerator(wikis), Content);
    });

    test("raw & promise", async () => {
        const wikis = await V4.searchWikis(searchString, { page: 1, raw: true });
        testArray(wikis.items, ID_TYPE);
    });
});