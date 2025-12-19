import { type NextRequest, NextResponse } from 'next/server';
import packageInfo from '../../../../../package.json' with { type: 'json' };

class MiddlewareUtils {
    middleware = (request: NextRequest): NextResponse => {
        const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
        const cspHeader = this.getContentSecurityPolicies(
            nonce,
            process.env.NEXT_PUBLIC_ENV!,
        ).join('; ');

        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-nonce', nonce);
        requestHeaders.set('Content-Security-Policy', cspHeader);

        const response = NextResponse.next({
            request: { headers: requestHeaders },
        });
        response.headers.set('Content-Security-Policy', cspHeader);

        return response;
    };

    private getContentSecurityPolicies = (
        nonce: string,
        env: string,
    ): string[] => {
        const isProd = env === 'production' || env === 'staging';
        const isLocal = env === 'local';

        // List of hosts to allow to embed the App in an `iframe`. For now, we
        // only have Common Ground app as a one-off experiment. If we get more
        // similar requests, let's move this to an environment variable.
        const allowedInFrameHosts = ['https://app.cg'];
        const allowedInFrameHostsNonProd = ['https://vercel.live'];

        const scriptSrc = isProd
            ? `'strict-dynamic'`
            : isLocal
              ? `'unsafe-eval'`
              : 'https://vercel.live';
        const frameSrc = isProd
            ? allowedInFrameHosts.join(' ')
            : [...allowedInFrameHosts, ...allowedInFrameHostsNonProd].join(' ');
        const fontSrc = isProd ? '' : ' https://vercel.live';

        const policies = [
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

        // Add CSP reporting to Sentry
        try {
            const envName = process.env.NEXT_PUBLIC_ENV!;
            const release = packageInfo.version;
            const sentryUri = process.env.SENTRY_REPORT_URI;
            const sentryKey = process.env.SENTRY_REPORT_KEY;

            if (sentryUri && sentryKey) {
                const reportUri = `${sentryUri}?sentry_key=${encodeURIComponent(
                    sentryKey,
                )}&sentry_environment=${encodeURIComponent(envName)}&sentry_release=${encodeURIComponent(release)}`;
                policies.push(`report-uri ${reportUri}`);
            }
        } catch {
            // ignore if env vars are not available
        }

        return policies;
    };
}

export const middlewareUtils = new MiddlewareUtils();
