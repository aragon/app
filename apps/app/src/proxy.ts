import { proxyUtils } from '@/modules/application/utils/proxyUtils';

export const proxy = proxyUtils.proxy;

/*
 * Match all request paths except for the ones starting with:
 * - api (API routes)
 * - _next/(static|image) (static and image optimization files)
 * - favicon.ico (favicon file)
 * (See https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
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
