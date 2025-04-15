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

    private getContentSecurityPolicies = (nonce: string, env: string): string[] => [
        "default-src 'self'",
        // 'strict-dynamic' disables host-based allowlists like https:
        // In preview, we remove it to allow Vercel Comments script injection
        `script-src 'self' 'nonce-${nonce}' https: ${env === 'production' ? "'strict-dynamic'" : 'https://vercel.live'}`,
        `style-src 'self' https://fonts.googleapis.com 'unsafe-inline'`,
        'img-src * blob: data:',
        'connect-src *',
        `font-src 'self' https://fonts.gstatic.com ${env === 'production' ? '' : 'https://vercel.live'}`,
        "object-src 'self'",
        "base-uri 'self'",
        "form-action 'self'",
        `frame-ancestors ${env === 'production' ? "'none'" : 'https://vercel.live'}`,
        `frame-src ${env === 'production' ? "'none'" : 'https://vercel.live'}`,
        'upgrade-insecure-requests',
    ];
}

export const middlewareUtils = new MiddlewareUtils();
