import { middlewareUtils } from '@/modules/application/utils/middlewareUtils';

export const middleware = middlewareUtils.middleware;

/*
 * Match all request paths except for the ones starting with:
 * - api (API routes)
 * - _next/(static|image) (static and image optimization files)
 * - favicon.ico (favicon file)
 * (See https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
 *
 * NOTE:
 * The middleware configs needs to be placed on the src/middleware.ts file, otherwise NextJs throws an error at build time.
 */
export const config = {
    matcher: [
        {
            source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
            missing: [
                { type: 'header', key: 'next-router-prefetch' },
                { type: 'header', key: 'purpose', value: 'prefetch' },
            ],
        },
    ],
};
