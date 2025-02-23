/**
 * @module scrapers
 */

import { load } from 'cheerio';
import { JVCODE_URL, SELECTORS, SMILEY_URL } from '../vars.js';
import { decodeJvCare } from '../utils.js';
import { curl } from '../requests.js';

// booléen à true = supprimer l'élément
const TAGS: { [key: string]: [[string, string], boolean] } = {
    "code.code-jv": [["<code>", "</code>"], false],
    "em": [["''", "''"], false],
    "strong": [["'''", "'''"], false],
    "span.bloc-spoil-jv.en-ligne": [["", ""], false],
    "input": [["", ""], true],
    "label": [["", ""], true],
    "button": [["", ""], true],
    "pre": [["<br><br>", "<br><br>"], false],
    "div.contenu-spoil": [["<spoil>","</spoil>"], false],
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
            .replace(/<\/?(ul|ol)>/g, '\n\n')
            .replace(/<\/li([\*|#]+?)>/g, '\n')
            .replace(/<li([\*|#]+?)>/g, '$1 ')
            .replace(/<\/p><p>/g, '\n\n')
            .replace(/<\/?p>/g, '')
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
        const smileys = $("img").filter((i, x) => $(x).attr("src")!.startsWith(SMILEY_URL));
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

        function replaceLists(parent: cheerio.Cheerio, suffix: string = ''): boolean {
            const lists = { ol: "#", ul: "*" };
            let hasNestedList = false;

            for (const [selector, indicator] of Object.entries(lists)) { // itérations sur les types de liste
                const childrenList = parent.find(selector); // recherche des listes du type contenu dans l'élement parent

                childrenList.each((_: number, child: cheerio.Element) => { // pour chaque liste du type trouvée
                    hasNestedList = true;

                    const Child = $(child);
                    const childrenLi = Child.find('li');
                    const newSuffix = suffix.length === 0 || suffix.slice(-1) === indicator ? suffix + indicator : suffix + '' + indicator; // cette str résume l'arborescence des listes jusqu'à la cible

                    childrenLi.each((_: number, li: cheerio.Element) => { // pour chaque li de cette liste
                        const Li = $(li);
                        const doesChildHaveNestedList = replaceLists(Li, newSuffix); // appel récursif en incrémentant la profondeur du type de la liste trouvée
                        Li.replaceWith(doesChildHaveNestedList ? `${Li.html()}` : `<li${newSuffix}>${Li.html()}</li${newSuffix}>`); // nouveau tag indiquant la profondeur
                    });
                    if (suffix.length > 0) {
                        childrenList.replaceWith(`${childrenList.html()}`); // destruction des ol et ul intérieurs
                    } else {
                        childrenList.removeAttr("class");
                    }
                })
            }

            return hasNestedList;
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
     * @param {{ replaceQTags?: boolean }} [options]
     * @param {boolean} [options.replaceQTags] `true` pour délimiter les citations par le tag `q`, `false` (par défaut) pour laisser la notation usuelle qui utilise des chevrons.
     * @returns  {string}
     */
    public static htmlToJVCode(markup: string, { replaceQTags = true }: { replaceQTags?: boolean } = {}): string {
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
     *
     * @param {string} markup chaîne de caractères JVCode
     * @returns  {Promise<string>}
     */
    public static async jvCodeToHtml(markup: string): Promise<string> {
        const response = await curl(JVCODE_URL, { method: "POST", data: { texte: markup }, headers: { "Content-Type": "application/x-www-form-urlencoded" } });
        return await response.text();
    }
}