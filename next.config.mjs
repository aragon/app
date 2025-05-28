import BundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
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

const sentryConfig = {
    // Aragon organisation on Sentry
    org: 'aragonorg',
    // Sentry project
    project: 'app-next',
    // Auth token needed for uploading source maps
    authToken: process.env.NEXT_SECRET_SENTRY_AUTH_TOKEN,
    // Make sure to upload all files and source maps
    widenClientFileUpload: true,
    // Use tunneling to forward events to Sentry and circumvent ad blockers
    tunnelRoute: '/api/monitoring',
    // Disable Sentry debug logger to save bundle size
    disableLogger: true,
    // Release version for Sentry
    release: { name: packageInfo.version },
    // Delete sourcemaps from NextJs build after upload
    sourcemaps: { deleteSourcemapsAfterUpload: true },
    // Disable sending data to Sentry
    telemetry: false,
    // Options to optimise the bundle size
    bundleSizeOptimizations: {
        // Exclude replay worker from bundle as self-hosted for current CSP policies
        excludeReplayWorker: true,
    },
};

/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            {
                source: '/dao/:network/:addressOrEns',
                destination: '/dao/:network/:addressOrEns/dashboard',
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

        // Loader needed for mp4 files (background textures)
        config.module.rules.push({
            test: /\.mp4$/,
            type: 'asset/resource',
            generator: {
                filename: 'static/media/[name].[hash][ext]',
            },
        });

        return config;
    },
};

export default withSentryConfig(withBundleAnalyzer(nextConfig), sentryConfig);
