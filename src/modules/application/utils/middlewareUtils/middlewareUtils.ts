import { type NextRequest, NextResponse } from 'next/server';

class MiddlewareUtils {
    middleware = (request: NextRequest): NextResponse => {
        const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
        const cspHeader = this.getContentSecurityPolicies(nonce, process.env.NEXT_PUBLIC_ENV!).join('; ');

        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-nonce', nonce);
        requestHeaders.set('Content-Security-Policy', cspHeader);

        const response = NextResponse.next({ request: { headers: requestHeaders } });
        response.headers.set('Content-Security-Policy', cspHeader);

        return response;
    };

    private getContentSecurityPolicies = (nonce: string, env: string): string[] => {
        const isProd = env === 'production' || env === 'staging';
        const isLocal = env === 'local';

        const scriptSrc = isProd ? `'strict-dynamic'` : isLocal ? `'unsafe-eval'` : 'https://vercel.live';
        const frameSrc = isProd ? `'none'` : 'https://vercel.live';
        const fontSrc = isProd ? '' : ' https://vercel.live';

        return [
            "default-src 'self'",
            `script-src 'self' 'nonce-${nonce}' https: ${scriptSrc}`,
            `style-src 'self' https://fonts.googleapis.com 'unsafe-inline'`,
            'img-src * blob: data:',
            'connect-src *',
            `font-src 'self' https://fonts.gstatic.com${fontSrc}`,
            "object-src 'self'",
            "base-uri 'self'",
            "form-action 'self'",
            `frame-ancestors ${frameSrc}`,
            `frame-src ${frameSrc}`,
            'upgrade-insecure-requests',
        ];
    };
}

export const middlewareUtils = new MiddlewareUtils();
