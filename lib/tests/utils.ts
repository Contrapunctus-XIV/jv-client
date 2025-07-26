import { expect } from "vitest";

function isAsyncGenerator(value: any): boolean {
    return (new Boolean(value)).valueOf() && typeof value === 'object' && typeof value.next === 'function' && typeof value.return === 'function' && typeof value.throw === 'function' && value[Symbol.asyncIterator] !== undefined;
}

export async function getFirstValueOfAsyncGenerator<T>(asyncGenerator: AsyncGenerator<T, any, unknown>): Promise<T | undefined> {
    expect(isAsyncGenerator(asyncGenerator)).toBe(true);
    
    for await (const item of asyncGenerator) {
        return item;
    }
    return undefined;
}

export async function testArray(array: any, expectedType: any) {
    expect(Array.isArray(array)).toBe(true);
    expect(array.length).toBeGreaterThan(0);

    for (const item of array) {
        if (expectedType.constructor && expectedType.constructor !== Object) {
            expect(item).toBeInstanceOf(expectedType);
        } else if (Object.prototype.toString.call(expectedType) === '[object Object]') {
            expect(item).toMatchObject(expectedType);
        }
    }
}