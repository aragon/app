import BundleAnalyzer from '@next/bundle-analyzer';
import packageInfo from './package.json' with { type: 'json' };

const withBundleAnalyzer = BundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

const webFunctionalities = [
    'accelerometer=()',
    'attribution-reporting=()',
    'autoplay=()',
    'bluetooth=()',
    'browsing-topics=()',
    'camera=()',
    'compute-pressure=()',
    'cross-origin-isolated=()',
    'display-capture=()',
    'encrypted-media=()',
    'fullscreen=()',
    'gamepad=()',
    'geolocation=()',
    'gyroscope=()',
    'hid=()',
    'idle-detection=()',
    'local-fonts=()',
    'magnetometer=()',
    'microphone=()',
    'midi=()',
    'otp-credentials=()',
    'payment=()',
    'picture-in-picture=()',
    'publickey-credentials-create=()',
    'publickey-credentials-get=()',
    'screen-wake-lock=()',
    'serial=()',
    'storage-access=()',
    'usb=()',
    'web-share=()',
    'window-management=()',
    'xr-spatial-tracking=()',
];

const contentSecurityPolicies = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    'img-src * blob: data:',
    'connect-src *',
    "font-src 'self' https://fonts.gstatic.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
];

/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            {
                source: '/dao/:id',
                destination: '/dao/:id/dashboard',
                permanent: true,
            },
        ];
    },
    async headers() {
        return [
            // Security headers for all paths
            {
                source: '/:path*',
                headers: [
                    // Do not allow usage of application inside iframes
                    { key: 'X-Frame-Options', value: 'DENY' },
                    // Enforce HTTPS access
                    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
                    // Explicitly disable all web functionalities
                    { key: 'Permissions-Policy', value: webFunctionalities.join(', ') },
                    // Prevents the browser from guessing the content type when related header is not set
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    // Allow browsers to proactively perform domain name resolution on extenal resources (links, CSS, ..)
                    { key: 'X-DNS-Prefetch-Control', value: 'on' },
                    // Apply content security policies
                    { key: 'Content-Security-Policy', value: contentSecurityPolicies.join('; ') },
                ],
            },
            // CORS headers for api routes
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_API_ALLOWED_DOMAIN },
                    { key: 'Access-Control-Allow-Methods', value: 'POST' },
                    { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
                ],
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
                port: '',
            },
        ],
    },
    experimental: {
        typedRoutes: true,
    },
    env: {
        version: packageInfo.version,
    },
    webpack: (config) => {
        // Configs needed by wallet-connect (see https://docs.walletconnect.com/appkit/next/core/installation#extra-configuration)
        config.externals.push('pino-pretty', 'lokijs', 'encoding');

        return config;
    },
};

export default withBundleAnalyzer(nextConfig);
