import { beforeEach, beforeAll } from "vitest";
import { sleep } from "../utils.js";
import dotenv from "dotenv";
import Client from "../classes/Client.js";
import ForumClient from "../classes/ForumClient.js";
import Profile from "../classes/Profile.js";
import V4Client from "../classes/V4Client.js";
import { delayBetweenTests } from "./vars.js";

dotenv.config({ quiet: true });

declare global {
    var client: Client;
    var forumClient: ForumClient;
    var profile: Profile;
    var v4Client: V4Client;
}

beforeEach(async () => {
    await sleep(delayBetweenTests);
});

beforeAll(async () => {
    global.client = new Client();
    await global.client.injectConiunctio(process.env.CONIUNCTIO!);
    global.forumClient = new ForumClient(global.client);
    global.profile = new Profile(global.client);
    global.v4Client = new V4Client(global.client);
});