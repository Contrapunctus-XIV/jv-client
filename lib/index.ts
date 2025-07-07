import Client from "./classes/Client.js";
import Profile from "./classes/Profile.js";
import Forum from "./classes/Forum.js";
import Content, { Video } from "./classes/Content.js";
import Game from "./classes/Game.js";
import Account from "./classes/Account.js";
import V4 from "./scrapers/V4.js";
import ContentComment from "./classes/ContentComment.js";
import V4Client from "./classes/V4Client.js";
import Review from "./classes/Review.js";
import Topic from "./classes/Topic.js";
import JVCode from "./scrapers/JVCode.js";
import Post from "./classes/Post.js";
import ForumClient from "./classes/ForumClient.js";
import Alias from "./classes/Alias.js";
import { convertJVCStringToDate, decodeJvCare, isValidJVCText } from "./utils.js";
import { callApi, curl } from "./requests.js";

/**
 * Contient l'ensemble de ce qui est exporté par la librairie.
 */
const JVClient = {
    Client, Account, Profile, Forum, Content, Video, V4, ContentComment, Game, V4Client, Review, Topic, JVCode,
    Post, ForumClient, Alias, convertJVCStringToDate, decodeJvCare, isValidJVCText, callApi, curl
};

/**
 * @hidden
 */
export default JVClient;

/**
 * @hidden
 */
export {
    Client, Account, Profile, Forum, Content, Video, V4, ContentComment, Game, V4Client, Review, Topic, JVCode,
    Post, ForumClient, Alias, convertJVCStringToDate, decodeJvCare, isValidJVCText, callApi, curl
};