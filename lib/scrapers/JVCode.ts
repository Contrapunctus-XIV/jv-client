/**
 * @module scrapers
 */

import { load } from 'cheerio';
import { JVCODE_URL, SELECTORS, SMILEY_URL } from '../vars.js';
import { decodeJvCare } from '../utils.js';
import { request } from '../requests.js';
import { LibTypes } from '../types/index.js';

// booléen à true = supprimer l'élément
const TAGS: { [key: string]: [[string, string], boolean] } = {
    "code.code-jv": [["<code>", "</code>"], false],
    "em": [["''", "''"], false],
    "strong": [["'''", "'''"], false],
    "span.bloc-spoil-jv.en-ligne": [["", ""], false],
    "div.bloc-spoil-jv": [["", ""], false],
    "input": [["", ""], true],
    "label": [["", ""], true],
    "button": [["", ""], true],
    "pre": [["<br>", "<br>"], false],
    "div.contenu-spoil": [["<spoil>","</spoil>"], false],
    "span.contenu-spoil": [["<spoil>","</spoil>"], false],
    "div.nested-quote-toggle-box": [["", ""], true],
    "div": [["", ""], false]
};

/**
 * Classe contenant des méthodes statiques permettant de convertir du HTML en JVCode et vice-versa.
 *
 * @abstract
 * @hideconstructor
 */
export default abstract class JVCode {
    private static addBreaks(markup: string): string {
        let output = markup
            .replace(/<br\/?>/g, '\n')
            .replace(/<\/?(ul|ol)>/g, '\n')
            .replace(/<\/li([\*|#]+?)>/g, '')
            .replace(/<li([\*|#]+?)>/g, '\n$1 ')
            .replace("<spoil><p>", "<spoil>")
            .replace("</p></spoil>", "</spoil>")
            .replace(/<\/?p>/g, '\n\n')
            .replace(/<q>/g, '\n\n<q>')
            .replace(/<\/q>/g, '</q>\n\n')
            .replace(/(\n{3,})/g, '\n\n')
            .replace(/ {2,}/g, ' ')
            .trim();

        return output;
    }

    private static replaceQTagsByAngleBrackets(markup: string): string {
        const $ = load(markup);
        const qEls = $("q");

        qEls.get().forEach(x => {
            const text = JVCode.replaceQTagsByAngleBrackets($(x).html()!).split("\n");
            const angleBracketText = [];
            for (const line of text) {
                angleBracketText.push(`> ${line}`);
            }
            const finalText = angleBracketText.join("\n");
            $(x).replaceWith(finalText);
        });

        return $("body").html()!.replaceAll("&gt;", ">");
    }

    private static replaceLinks(markup: string): string {
        const $ = load(markup);
        const links = $(SELECTORS["jvCare"]);
        links.get().forEach(x => 
            $(x).replaceWith(decodeJvCare($(x).attr("class")!))
        );

        const aEls = $("a");
        aEls.get().forEach(x => $(x).replaceWith($(x).attr("href")!));

        return $("body").html()!;
    }

    private static replaceSmileys(markup: string): string {
        const $ = load(markup);
        const smileys = $("img").filter((i, x) => $(x).attr("src")!.startsWith(SMILEY_URL) || $(x).hasClass("img-stickers"));
        smileys.get().forEach(x => $(x).replaceWith($(x).attr("alt") || ""));

        return $("body").html()!;
    }

    private static replaceTags(markup: string): string {
        const $ = load(markup);

        function replaceBlockquotes(parent: cheerio.Cheerio): void {
            const children = parent.find('blockquote');
            children.each((_: number, element: cheerio.Element) => {
                const el = $(element);
                replaceBlockquotes(el);
                el.replaceWith(`<q>${el.html()}</q>`);
            });
        }

        function replaceLists(parent: cheerio.Cheerio, suffix: string = "") {
            const listsTypes = [["ol", "#"], ["ul", "*"]];

            for (let i = 0; i < listsTypes.length; i++) { // itération sur les types de liste
                const [selector, indicator] = listsTypes[i];
                // recherche des listes du type contenu dans l'élement parent
                // on recherche toujours les ul et ol les plus en surface, les imbriqués seront traités par récursivité
                const lists = suffix.length === 0 ? parent.find(`${selector}:not(${selector} ${selector}):not(${listsTypes[1-i][0]} ${selector})`) : parent.children(selector);
                const newSuffix = suffix + indicator;
                lists.each((_, list) => {
                    const listObject = $(list);
                    const lis = listObject.children("li");

                    // itération sur les li de la liste
                    lis.each((_, li) => {
                        const liObject = $(li);
                        replaceLists(liObject, newSuffix); // appel récursif
                        // si texte en surface vide, alors pas besoin de balise intermédiaire
                        if (liObject.clone().children().remove().end().text().trim().length === 0) {
                            liObject.replaceWith(liObject.html()!);
                        } else {
                            liObject.replaceWith(`<li${newSuffix}>${liObject.html()}</li${newSuffix}>`);
                        }
                    });

                    listObject.removeAttr("class");

                    // retrait des ol et ul intermédiaires
                    if (suffix.length > 0) {
                        listObject.replaceWith(listObject.html()!);
                    }
                });
            }
        }

        replaceBlockquotes($.root());
        replaceLists($.root());

        for (const [curr, out] of Object.entries(TAGS)) {
            const els = $(curr);
            els.each((_, el) => {
                if (out[1]) {
                    $(el).remove();
                    return;
                }

                const newContent = `${out[0][0]}${$.html($(el).contents())}${out[0][1]}`;
                $(el).replaceWith(newContent);
                $(el).removeAttr('class').removeAttr('id');
            });
        }
        return $('body').html()!;
    }

    /**
     * Renvoie la chaîne de caractères JVCode correspondant au HTML passé en entrée.
     *
     * @param {string} markup HTML
     * @param {LibTypes.Args.JVCode.ReplaceQTags} [options]
     * @param {boolean} [options.replaceQTags] `true` pour délimiter les citations par le tag `q`, `false` (par défaut) pour laisser la notation usuelle qui utilise des chevrons
     * @returns  {string}
     */
    public static htmlToJVCode(markup: string, { replaceQTags = true }: LibTypes.Args.JVCode.ReplaceQTags = {}): string {
        markup = JVCode.replaceTags(markup);
        markup = JVCode.replaceLinks(markup);
        markup = JVCode.replaceSmileys(markup);
        markup = JVCode.addBreaks(markup);
        if (replaceQTags) {
            markup = JVCode.replaceQTagsByAngleBrackets(markup);
        }

        return markup;
    }

    /**
     * Convertit du JVCode en HTML par une requête au site JVC.
     * @hidden
     * @deprecated
     * @param {string} markup chaîne de caractères JVCode
     * @returns  {Promise<string>}
     */
    private static async jvCodeToHtml(markup: string): Promise<string> {
        const response = await request(JVCODE_URL, { method: "POST", data: { texte: markup }, bodyMode: "url" });
        return await response.text();
    }
}