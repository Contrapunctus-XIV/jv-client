import { expect, describe, test } from "vitest";
import { convertJVCStringToDate, decodeAllJvCare, decodeJvCare, isValidJVCText } from "../utils.js";
import { FRENCH_MONTHS_TO_NUMBER } from "../vars.js";
import { load } from "cheerio";
import { badCharacterJvcText, jvCare, jvCareExpected, jvCareMarkup, jvCareMarkupExpected, shortJvcText, validJvcText } from "./vars.js";

describe("convertJVCStringToDate", () => {
    const numbersToFrenchMonths = Object.fromEntries(Object.entries(FRENCH_MONTHS_TO_NUMBER).map(([k,v]) => [v,k]));
    const now = new Date();
    const currentYear = now.getFullYear();
    const isoCurrentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
    const currentFrenchMonth = numbersToFrenchMonths[now.getMonth()];
    const currentDate = now.getDate().toString().padStart(2, '0');
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentSecond = now.getSeconds().toString().padStart(2, '0');

    test("format dd mm yyyy à hh:mm", () => {
        const date = convertJVCStringToDate(`${currentDate} ${currentFrenchMonth} ${currentYear} à ${currentHour}:${currentMinute}:${currentSecond}`)!.toISOString();
        expect(date).toBe(`${currentYear}-${isoCurrentMonth}-${currentDate}T${currentHour}:${currentMinute}:${currentSecond}.000Z`);
    });

    test("format dd mm yyyy", () => {
        const date = convertJVCStringToDate(`${currentDate} ${currentFrenchMonth} ${currentYear}`)!.toISOString();
        expect(date).toBe(`${currentYear}-${isoCurrentMonth}-${currentDate}T00:00:00.000Z`);
    });

    test("format dd/mm/yyyy", () => {
        const date = convertJVCStringToDate(`${currentDate}/${isoCurrentMonth}/${currentYear}`)!.toISOString();
        expect(date).toBe(`${currentYear}-${isoCurrentMonth}-${currentDate}T00:00:00.000Z`);
    });

    test("format hh:mm:ss", () => {
        const date = convertJVCStringToDate(`${currentHour}:${currentMinute}:${currentSecond}`)!.toISOString();
        expect(date).toBe(`${currentYear}-${isoCurrentMonth}-${currentDate}T${currentHour}:${currentMinute}:${currentSecond}.000Z`);
    });
});

describe("decodeJvCare", () => {
    test("standard", () => {
        expect(decodeJvCare(jvCare)).toBe(jvCareExpected);
    });
});

describe("decodeAllJvCare", () => {
    test("standard", () => {
        expect(decodeAllJvCare(load(jvCareMarkup)).html()).toBe(jvCareMarkupExpected);
    });
});

describe("isValidJVCText", () => {
    test("with valid text", () => {
        expect(isValidJVCText(validJvcText)).toBe(true);
    });

    test("with short text", () => {
        expect(isValidJVCText(shortJvcText)).toBe(false);
    });

    test("with bad character", () => {
        expect(isValidJVCText(badCharacterJvcText)).toBe(false);
    });
});