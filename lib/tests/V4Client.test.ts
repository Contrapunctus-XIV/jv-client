import V4Client from "../classes/V4Client.js";
import { expect, describe, test } from "vitest";
import { answer, content, game, ID_TYPE, nonexistentComment, comment, nonexistentContent, nonexistentGame, nonexistentReview, review, delayBetweenComments, delayBetweenCommentsUpdate, reviewMark, reviewText, machineId, commentText, commentUpdateText } from "./vars.js";
import Client from "../classes/Client.js";
import { NonexistentContent, JvcErrorMessage, NotConnected } from "../errors.js";
import ContentComment from "../classes/ContentComment.js";
import { sleep } from "../utils.js";
import Review from "../classes/Review.js";

let newComment: ContentComment;
let newReview: Review;

describe("addComment", () => {
    test("standard", async () => {
        const comment = await global.v4Client.addComment(content, commentText);
        expect(comment).toMatchObject(ID_TYPE);
        newComment = new ContentComment(comment.id, content);
    });

    test("on nonexistent content", async () => {
        await sleep(delayBetweenComments);
        await expect(global.v4Client.addComment(nonexistentContent, commentText)).rejects.toThrowError(NonexistentContent);
    });

    test("with not connected client", async () => {
        const v4c = new V4Client(new Client());
        await expect(v4c.addComment(content, "")).rejects.toThrowError(NotConnected);
    });
});

describe("updateComment", () => {
    test("standard", async () => {
        await sleep(delayBetweenCommentsUpdate);
        const comment = await global.v4Client.updateComment(newComment, commentUpdateText);
        expect(comment.content.raw).toBe(commentUpdateText);
    });

    test("on nonexistent comment", async () => {
        await sleep(delayBetweenCommentsUpdate);
        await expect(global.v4Client.updateComment(nonexistentComment, commentText)).rejects.toThrowError(NonexistentContent);
    });

    test("with not connected client", async () => {
        const v4c = new V4Client(new Client());
        await expect(v4c.updateComment(newComment, commentText)).rejects.toThrowError(NotConnected);
    });
});

describe("addCommentVote", () => {
    test("standard", async () => {
        const result = await global.v4Client.addCommentVote(comment, 1);
        expect(result).toBe(undefined);
    });

    test("on nonexistent comment", async () => {
        await expect(global.v4Client.addCommentVote(nonexistentComment, 1)).rejects.toThrowError(JvcErrorMessage);
    });

    test("with not connected client", async () => {
        const v4c = new V4Client(new Client());
        await expect(v4c.addCommentVote(comment, 1)).rejects.toThrowError(NotConnected);
    });

    test("with invalid comment", async () => {
        await expect(global.v4Client.addCommentVote(newComment, 1)).rejects.toThrowError(JvcErrorMessage);
    });
});

describe("deleteCommentVote", () => {
    test("standard", async () => {
        const result = await global.v4Client.deleteCommentVote(comment);
        expect(result).toBe(undefined);
    });

    test("with not connected client", async () => {
        const v4c = new V4Client(new Client());
        await expect(v4c.deleteCommentVote(comment)).rejects.toThrowError(NotConnected);
    });
});

describe("deleteComment", () => {
    test("standard", async () => {
        await global.v4Client.deleteComment(newComment);
        const existence = await newComment.doesCommentExist();
        expect(existence).toBe(false);
    });

    test("on nonexistent comment", async () => {
        await expect(global.v4Client.deleteComment(nonexistentComment)).rejects.toThrowError(NonexistentContent);
    });

    test("with not connected client", async () => {
        const v4c = new V4Client(new Client());
        await expect(v4c.deleteComment(newComment)).rejects.toThrowError(NotConnected);
    });

    test("with invalid comment", async () => {
        await expect(global.v4Client.deleteComment(comment)).rejects.toThrowError(JvcErrorMessage);
    });
});

describe("addReview", () => {
    test("standard", async () => {
        const review = await global.v4Client.addReview(game, machineId, reviewMark, reviewText);
        expect(review).toMatchObject(ID_TYPE);
        newReview = new Review(review.id, game, machineId);
    });

    test("with unexisting game", async () => {
        await expect(global.v4Client.addReview(nonexistentGame, machineId, reviewMark, reviewText)).rejects.toThrowError(NonexistentContent);
    });

    test("with not connected client", async () => {
        const v4c = new V4Client(new Client());
        await expect(v4c.addReview(game, machineId, reviewMark, reviewText)).rejects.toThrowError(NotConnected);
    });
});

describe("deleteReview", () => {
    test("standard", async () => {
        await global.v4Client.deleteReview(newReview);
        const existence = await newReview.doesReviewExist();
        expect(existence).toBe(false);
    });

    test("with unexisting review", async () => {
        await expect(global.v4Client.deleteReview(nonexistentReview)).rejects.toThrowError(NonexistentContent);
    });

    test("with not connected client", async () => {
        const v4c = new V4Client(new Client());
        await expect(v4c.deleteReview(newReview)).rejects.toThrowError(NotConnected);
    });

    test("with invalid review", async () => {
        await expect(global.v4Client.deleteReview(review)).rejects.toThrowError(JvcErrorMessage);
    });
});

describe("addAnswer", () => {
    test("standard", async () => {
        const result = await global.v4Client.addAnswer(answer,  commentText);
        expect(result).toMatchObject(ID_TYPE);
        await sleep(5_000);
        await global.v4Client.deleteComment(new ContentComment(result.id, answer.contentId));
    });

    test("on nonexistent comment", async () => {
        await expect(global.v4Client.addAnswer(nonexistentComment, commentText)).rejects.toThrowError(NonexistentContent);
    });

    test("with not connected client", async () => {
        const v4c = new V4Client(new Client());
        await expect(v4c.addAnswer(answer, commentText)).rejects.toThrowError(NotConnected);
    });
});