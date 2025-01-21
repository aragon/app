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
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: ${env !== 'local' ? '' : "'unsafe-eval'"}`,
        `style-src 'self' https://fonts.googleapis.com 'unsafe-inline'`,
        'img-src * blob: data:',
        'connect-src *',
        "font-src 'self' https://fonts.gstatic.com",
        "object-src 'self'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        'upgrade-insecure-requests',
    ];
}

export const middlewareUtils = new MiddlewareUtils();
