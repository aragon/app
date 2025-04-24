import type { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import type { NextURL } from 'next/dist/server/web/next-url';
import { INTERNALS } from 'next/dist/server/web/spec-extension/request';
import type { NextRequest } from 'next/server';
import { generateRequest } from './request';

export const generateNextRequest = (request?: Partial<NextRequest>): NextRequest => ({
    // eslint-disable-next-line @typescript-eslint/no-misused-spread
    ...generateRequest(request),
    cookies: {} as RequestCookies,
    nextUrl: {} as NextURL,
    page: undefined,
    ua: undefined,
    [INTERNALS]: { cookies: {} as RequestCookies, url: '', nextUrl: {} as NextURL },
});
