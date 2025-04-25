import type { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import type { NextURL } from 'next/dist/server/web/next-url';
import type { NextRequest } from 'next/server';
import { generateRequest } from './request';

export const generateNextRequestCookies = (cookies?: Partial<RequestCookies>): RequestCookies => ({
    [Symbol.iterator]: jest.fn(),
    size: 0,
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
    toString: jest.fn(),
    // eslint-disable-next-line @typescript-eslint/no-misused-spread
    ...cookies,
});

export const generateNextRequest = (request?: Partial<NextRequest>): NextRequest =>
    ({
        // eslint-disable-next-line @typescript-eslint/no-misused-spread
        ...generateRequest(),
        cookies: generateNextRequestCookies(),
        nextUrl: { href: 'http://test.com' } as NextURL,
        page: undefined,
        ua: undefined,
        ...request,
    }) as NextRequest;
