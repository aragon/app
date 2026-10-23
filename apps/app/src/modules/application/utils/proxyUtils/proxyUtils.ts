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
        const isProd = env === 'production' || env === 'staging';
        const isLocal = env === 'local';

        // Hosts allowed to embed THIS app in an iframe → frame-ancestors.
        // Currently only Common Ground (one-off experiment).
        const iframeEmbedders = ['https://app.cg', 'https://app.safe.global'];
        const iframeEmbeddersNonProd: string[] = [];

        // Third-party iframes THIS app is allowed to render → frame-src.
        // WalletConnect's verify.walletconnect.org is loaded as a child iframe
        // by the WC SDK to attest origin/session when the user scans the QR.
        const embeddableHosts = ['https://verify.walletconnect.org'];
        const embeddableHostsNonProd = ['https://vercel.live'];

        const scriptSrc = isProd
            ? `'strict-dynamic'`
            : isLocal
              ? `'unsafe-eval'`
              : 'https://vercel.live';
        const frameAncestors = isProd
            ? iframeEmbedders.join(' ')
            : [...iframeEmbedders, ...iframeEmbeddersNonProd].join(' ');
        const frameSrc = isProd
            ? embeddableHosts.join(' ')
            : [...embeddableHosts, ...embeddableHostsNonProd].join(' ');
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
            `frame-ancestors ${frameAncestors}`,
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

export const proxyUtils = new ProxyUtils();
