import { type NextRequest, NextResponse } from 'next/server';
import { createFeatureFlags } from '@/shared/featureFlags';
import packageInfo from '../../../../../package.json' with { type: 'json' };

// The help center, the knowledge-base site (apps/docs), lives in its own deployment and is served
// under this path while the helpCenter flag is on.
const helpCenterPath = '/help';

class ProxyUtils {
    proxy = async (request: NextRequest): Promise<NextResponse> => {
        const helpCenterResponse = await this.rewriteHelpCenter(request);

        if (helpCenterResponse != null) {
            return helpCenterResponse;
        }

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

    // Rewrites /help and everything under it to the site deployment (NEXT_PUBLIC_DOCS_URL) when the
    // helpCenter flag is on for this request (environment, CMS, cookie overrides). The site brings its
    // own pages and scripts, so the response keeps the origin's headers instead of the app's CSP.
    // Flag off, the request goes on to the app, which has no such route and answers not found.
    private rewriteHelpCenter = async (
        request: NextRequest,
    ): Promise<NextResponse | undefined> => {
        const { pathname, search } = request.nextUrl;
        const isHelpCenter =
            pathname === helpCenterPath ||
            pathname.startsWith(`${helpCenterPath}/`);
        const docsUrl = process.env.NEXT_PUBLIC_DOCS_URL;

        if (!isHelpCenter || docsUrl == null || docsUrl === '') {
            return undefined;
        }

        const featureFlags = createFeatureFlags(() =>
            request.headers.get('cookie'),
        );
        const isEnabled = await featureFlags.isEnabled('helpCenter');

        if (!isEnabled) {
            return undefined;
        }

        return NextResponse.rewrite(new URL(`${pathname}${search}`, docsUrl));
    };

    private getContentSecurityPolicies = (
        nonce: string,
        env: string,
    ): string[] => {
        const isLocal = env === 'local';

        // Hosts allowed to embed THIS app in an iframe → frame-ancestors.
        // Common Ground (one-off experiment) and the Safe app.
        const frameAncestors = ['https://app.cg', 'https://app.safe.global'];

        // Iframes THIS app is allowed to render → frame-src. WalletConnect's verify.walletconnect.org is loaded
        // as a child iframe by the WC SDK to attest origin/session when the user scans the QR; 'self' covers the
        // same-origin iframe the Vercel BotID challenge opens in deep-analysis mode.
        const frameSrc = ["'self'", 'https://verify.walletconnect.org'];

        // 'strict-dynamic' trusts the scripts our nonce'd bundles create, which the BotID challenge relies on,
        // and drops host allowlists, which is why the Vercel toolbar injected on previews is not allowed either.
        // Local development keeps 'unsafe-eval' for the dev bundles; BotID is not initialised there.
        const scriptSrc = isLocal ? `'unsafe-eval'` : `'strict-dynamic'`;

        const policies = [
            "default-src 'self'",
            `script-src 'self' 'nonce-${nonce}' https: ${scriptSrc}`,
            `style-src 'self' https://fonts.googleapis.com 'unsafe-inline'`,
            'img-src * blob: data:',
            'connect-src *',
            `font-src 'self' https://fonts.gstatic.com`,
            "object-src 'self'",
            "base-uri 'self'",
            "form-action 'self'",
            `frame-ancestors ${frameAncestors.join(' ')}`,
            `frame-src ${frameSrc.join(' ')}`,
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

export const proxyUtils = new ProxyUtils();
