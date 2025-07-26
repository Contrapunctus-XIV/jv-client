import { expect } from "vitest";
import Account from "../classes/Account.js";
import Alias from "../classes/Alias.js";
import Content from "../classes/Content.js";
import ContentComment from "../classes/ContentComment";
import Forum from "../classes/Forum.js";
import Topic from "../classes/Topic.js";
import Post from "../classes/Post.js";
import Game from "../classes/Game.js";
import Review from "../classes/Review.js";

export const ID_TYPE = { id: expect.any(Number) };

export const account = new Account(8291317);
export const bannedAccount = new Account(8028026);
export const nonexistentAccount = new Account(0);

export const alias = new Alias("InBigDespite2");
export const aliasId = 8291317;
export const bannedAlias = new Alias("PneuTueur31");
export const nonexistentAlias = new Alias("A");

export const content = new Content(2014501);
export const wikiContent = new Content(1997433);
export const nonexistentContent = new Content(0);

export const comment = new ContentComment(17846305, content);
export const nonexistentComment = new ContentComment(0, 0);
export const answer = new ContentComment(17846520, content);

export const forum = new Forum(51);
export const testForum = new Forum(5100);
export const nonexistentForum = new Forum(0);
export const forumUrl = "https://www.jeuxvideo.com/forums/0-51-0-1-0-1-0-blabla-18-25-ans.htm";
export const forumApiUrl = "https://api.jeuxvideo.com/forums/0-51-0-1-0-1-0-blabla-18-25-ans.htm";
export const forumTitle = "Blabla 18-25 ans";

export const lockReason = "test";
export const searchString = "test";

export const topic = new Topic(69508478);
export const topicToScrape = new Topic(76094343);
export const topicToScrapeInfos = {
    id: 76094343,
    url: 'https://www.jeuxvideo.com/forums/42-5100-76094343-1-0-1-0-test.htm',
    title: 'TEST',
    author: 'InBigDespite2',
    publicationDate: "2025-07-26T15:06:22.000Z",
    lastAnswerDate: "2025-07-26T15:50:25.000Z",
    nbPages: 2,
    forumId: 5100,
    resolved: false,
    lockReason: 'test'
};
export const topicForumId = 51;
export const topicUrl = "https://www.jeuxvideo.com/forums/42-51-69508478-1-0-1-0-moderation-ultime-pas-nous.htm";
export const topicApiUrl = "https://api.jeuxvideo.com/forums/42-51-69508478-1-0-1-0-moderation-ultime-pas-nous.htm";
export const nonexistentTopic = new Topic(0);
export const topicFirstPostId = 1164212750;

export const post = new Post(1164212750);
export const postToScrape = new Post(1275350615);
export const nonexistentPost = new Post(0);
export const postToScrapeInfos = {
    id: 1275350615,
    url: 'https://www.jeuxvideo.com/forums/message/1275350615',
    author: 'InBigDespite2',
    date: "2025-07-26T15:06:22.000Z",
    content: 'test',
    topicId: 76094343,
    page: 1
};

export const game = new Game(75478);
export const nonexistentGame = new Game(0);
export const machineId = 10;

export const newFavoriteForums = new Set([52, 5101])
export const newFavoriteTopics = new Set([69508478, 71094319]);
export const newFavoriteGames = new Set([531990, 75478]);

export const review = new Review(1149339, 75478, 10);
export const nonexistentReview = new Review(0, 0, 0);
export const reviewMark = 20;
export const reviewText = "test ".repeat(100);
export const commentText = "test";
export const commentUpdateText = "test2";
export const validJvcText = "test1234!";
export const shortJvcText = "a";
export const badCharacterJvcText = "test–";
export const profileDescription = Math.random().toString(36).slice(2, 8);
export const topicTitle = "test";
export const topicMessage = "test";
export const message = "test";
export const researchTopic = "test";

export const delayBetweenPosts = 20_000;
export const delayBetweenUploads = 1_000;
export const delayBetweenComments = 15_000;
export const delayBetweenCommentsUpdate = 10_000;
export const delayBetweenTests = 250;

export const testMarkup = `<div class="txt-msg  text-enrichi-forum "><p>test test</p><p>test<br>test</p><p><strong>test</strong> <em>test</em> <u>test</u> <s>test</s></p><ul class="liste-default-jv"><li>test <ul class="liste-default-jv"><li>test<ul class="liste-default-jv"><li>test</li><li>* test</li></ul></li><li>test</li></ul></li><li>test</li></ul><ol class="liste-default-jv"><li>test<ol class="liste-default-jv"><li>test<ol class="liste-default-jv"><li>test</li><li># test</li></ol></li><li>test</li></ol></li><li>test</li></ol><ul class="liste-default-jv"><li>test<ol class="liste-default-jv"><li>test</li><li>test</li></ol><ul class="liste-default-jv"><li><ol class="liste-default-jv"><li>test</li></ol></li></ul></li></ul><ol class="liste-default-jv"><li>test<ul class="liste-default-jv"><li>test</li><li>test</li></ul><ol class="liste-default-jv"><li><ul class="liste-default-jv"><li>test</li></ul></li></ol></li></ol><blockquote class="blockquote-jv"><p>test</p></blockquote><blockquote class="blockquote-jv"><p><strong>test</strong> <em>test</em> <u>test</u></p><ul class="liste-default-jv"><li>test<ul class="liste-default-jv"><li>test</li></ul></li></ul><ol class="liste-default-jv"><li>test<ol class="liste-default-jv"><li>test</li></ol></li></ol><p><span class="bloc-spoil-jv en-ligne"><input type="checkbox" id="e61f0ca3080ead7595d9671127b7ed8f" class="open-spoil"><label class="barre-head" for="e61f0ca3080ead7595d9671127b7ed8f"><span class="txt-spoil">Spoil</span><span class="aff-spoil">Afficher</span><span class="masq-spoil">Masquer</span></label><span class="contenu-spoil">test</span></span> </p></blockquote><blockquote class="blockquote-jv"><p><button class="btn deboucled-blockquote-button" blockquote-number="(2)">ouvrir</button></p><blockquote class="blockquote-jv deboucled-blockquote-container" style="display: none;"><blockquote class="blockquote-jv deboucled-blockquote-container" style="display: none;"><p>test</p></blockquote><ol class="liste-default-jv"><li>test</li></ol><p>test<br>test</p><p><strong>test</strong><br><span class="bloc-spoil-jv en-ligne"><input type="checkbox" id="c52daffaad910400b1748e7ff0d06336" class="open-spoil"><label class="barre-head" for="c52daffaad910400b1748e7ff0d06336"><span class="txt-spoil">Spoil</span><span class="aff-spoil">Afficher</span><span class="masq-spoil">Masquer</span></label><span class="contenu-spoil">test</span></span> <br><code class="code-jv">test</code></p></blockquote><pre class="pre-jv"><code class="code-jv">test</code></pre></blockquote><pre class="pre-jv"><code class="code-jv">test test</code></pre><p><span class="bloc-spoil-jv en-ligne"><input type="checkbox" id="cfb7944243a8d4d648cfcb9cf8ac3875" class="open-spoil"><label class="barre-head" for="cfb7944243a8d4d648cfcb9cf8ac3875"><span class="txt-spoil">Spoil</span><span class="aff-spoil">Afficher</span><span class="masq-spoil">Masquer</span></label><span class="contenu-spoil">test</span></span> <br><a href="https://image.noelshack.com/fichiers/2017/39/3/1506463228-risibg.png" target="_blank" class="xXx "><img class="img-shack" width="68" height="51" src="https://image.noelshack.com/minis/2017/39/3/1506463228-risibg.png" alt="https://image.noelshack.com/fichiers/2017/39/3/1506463228-risibg.png"></a></p><p><img src="https://image.jeuxvideo.com/smileys_img/1.gif" alt=":)" data-code=":)" title=":)" width="16" height="16"> <img src="https://image.jeuxvideo.com/smileys_img/39.gif" alt=":rire:" data-code=":rire:" title=":rire:" width="16" height="16"> </p><p><a href="https://contrapunctus-xiv.github.io/jv-client/" target="_blank" class="xXx ">https://contrapunctus-xiv.github.io/jv-client/</a></p><img class="img-stickers" src="https://image.jeuxvideo.com/stickers/p/st/1kkh" alt="[[sticker:p/1kkh]]"></div>`;
export const testMessage = `test test

test
test

'''test''' ''test'' <u>test</u> <s>test</s>

* test 
** test
*** test
*** * test
** test
* test

# test
## test
### test
### # test
## test
# test

* test
*# test
*# test
**# test

# test
#* test
#* test
##* test

> test
> 
> 

> '''test''' ''test'' <u>test</u>
> 
> * test
> ** test
> 
> # test
> ## test
> 
> <spoil>test</spoil> 
> 
> 

> > > test
> > > 
> > > 
> > 
> > # test
> > 
> > test
> > test
> > 
> > '''test'''
> > <spoil>test</spoil> 
> > <code>test</code>
> > 
> > 
> 
> <code>test</code>
> 

<code>test test</code>

<spoil>test</spoil> 
https://image.noelshack.com/fichiers/2017/39/3/1506463228-risibg.png

:) :rire: 

https://contrapunctus-xiv.github.io/jv-client/

[[sticker:p/1kkh]]`;

export const qTestMessage = `test test

test
test

'''test''' ''test'' <u>test</u> <s>test</s>

* test 
** test
*** test
*** * test
** test
* test

# test
## test
### test
### # test
## test
# test

* test
*# test
*# test
**# test

# test
#* test
#* test
##* test

<q>

test

</q>

<q>

'''test''' ''test'' <u>test</u>

* test
** test

# test
## test

<spoil>test</spoil> 

</q>

<q>

<q>

<q>

test

</q>

# test

test
test

'''test'''
<spoil>test</spoil> 
<code>test</code>

</q>

<code>test</code>
</q>

<code>test test</code>

<spoil>test</spoil> 
https://image.noelshack.com/fichiers/2017/39/3/1506463228-risibg.png

:) :rire: 

https://contrapunctus-xiv.github.io/jv-client/

[[sticker:p/1kkh]]`;

export const jvCareMarkup = `<html><head></head><body><div class="footer__title fs-4 lh-sm mb-1 d-sm-none">INFORMATIONS GÉNÉRALES</div>
<span class="JvCare 1F424F49CB4A42CB19C045C0 footer__link">Contact</span>
<span class="JvCare 1F4E4A4648444FC14E19C045C0 footer__link">L'équipe</span>
<span class="JvCare 1F424FC0C6C1464C45CB1945CB4E footer__link">Informations légales</span>
<span class="JvCare 1F424CC31945CB4E footer__link">C.G.U.</span>
<span class="JvCare 1F424CC41945CB4E footer__link">C.G.V.</span>
<span class="JvCare 1F4E4F4B43C14ACB464F491945CB4E footer__link">Modération</span>
<span class="JvCare 1FC04F4846CB46CAC3431E424F4944464B4349CB464A4846CB431945CB4E footer__link">Politique de confidentialité</span>
<span class="JvCare 1F424F4F474643C21945CB4E footer__link">Cookies</span>
<span class="JvCare 1FC243C1C4464243C21F4C43C143C11EC3CB46CA1945CB4E footer__link">Gérer Utiq</span>
<span class="JvCare 4D4AC44AC242C146C0CB2D4DC442194B46C2C0484AC6B24F4F474643B24F49C24349CB151627 footer__link cookie-consent">Préférences cookies</span>
<span class="JvCare 1F4943CCC24843CBCB43C11F footer__link">Newsletter</span>
<span class="JvCare 1F4DC4C54E481945CB4E footer__link">RSS</span>
<span class="JvCare 1FC14342C1C3CB431945CB4E footer__link">Jobs</span>
</body></html>`;

export const jvCareMarkupExpected = `<html><head></head><body><div class="footer__title fs-4 lh-sm mb-1 d-sm-none">INFORMATIONS GÉNÉRALES</div>
<span class="JvCare 1F424F49CB4A42CB19C045C0 footer__link" href="/contact.php">Contact</span>
<span class="JvCare 1F4E4A4648444FC14E19C045C0 footer__link" href="/mailform.php">L'équipe</span>
<span class="JvCare 1F424FC0C6C1464C45CB1945CB4E footer__link" href="/copyright.htm">Informations légales</span>
<span class="JvCare 1F424CC31945CB4E footer__link" href="/cgu.htm">C.G.U.</span>
<span class="JvCare 1F424CC41945CB4E footer__link" href="/cgv.htm">C.G.V.</span>
<span class="JvCare 1F4E4F4B43C14ACB464F491945CB4E footer__link" href="/moderation.htm">Modération</span>
<span class="JvCare 1FC04F4846CB46CAC3431E424F4944464B4349CB464A4846CB431945CB4E footer__link" href="/politique-confidentialite.htm">Politique de confidentialité</span>
<span class="JvCare 1F424F4F474643C21945CB4E footer__link" href="/cookies.htm">Cookies</span>
<span class="JvCare 1FC243C1C4464243C21F4C43C143C11EC3CB46CA1945CB4E footer__link" href="/services/gerer-utiq.htm">Gérer Utiq</span>
<span class="JvCare 4D4AC44AC242C146C0CB2D4DC442194B46C2C0484AC6B24F4F474643B24F49C24349CB151627 footer__link cookie-consent" href="javascript:jvc.displayCookieConsent();">Préférences cookies</span>
<span class="JvCare 1F4943CCC24843CBCB43C11F footer__link" href="/newsletter/">Newsletter</span>
<span class="JvCare 1F4DC4C54E481945CB4E footer__link" href="/jvxml.htm">RSS</span>
<span class="JvCare 1FC14342C1C3CB431945CB4E footer__link" href="/recrute.htm">Jobs</span>
</body></html>`;

export const jvCare = "JvCare 1F4943CCC24843CBCB43C11F";
export const jvCareExpected = "/newsletter/";