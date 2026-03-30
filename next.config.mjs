import { withSentryConfig } from '@sentry/nextjs';
import packageInfo from './package.json' with { type: 'json' };

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

const isPreview = process.env.NEXT_PUBLIC_ENV === 'preview';
const isDevelopment = process.env.NEXT_PUBLIC_ENV === 'development';
const disableSourcemaps = isPreview || isDevelopment;

const sentryConfig = {
    // Aragon organisation on Sentry
    org: process.env.SENTRY_ORG ?? process.env.NEXT_PUBLIC_SENTRY_ORG,
    // Sentry project
    project:
        process.env.SENTRY_PROJECT ?? process.env.NEXT_PUBLIC_SENTRY_PROJECT,
    // Auth token needed for uploading source maps
    authToken:
        process.env.SENTRY_AUTH_TOKEN ??
        process.env.NEXT_SECRET_SENTRY_AUTH_TOKEN,
    // Make sure to upload all files and source maps
    widenClientFileUpload: true,
    // Use tunneling to forward events to Sentry and circumvent ad blockers
    tunnelRoute: '/api/monitoring',
    // Tree-shake Sentry debug statements to save bundle size (replaces deprecated disableLogger)
    bundleSizeOptimizations: {
        excludeDebugStatements: true,
        excludeReplayWorker: true,
    },
    // Release version for Sentry
    release: { name: packageInfo.version },
    // Delete sourcemaps from NextJs build after upload
    // Disable source map upload for preview environments
    sourcemaps: disableSourcemaps
        ? { disable: true }
        : { deleteSourcemapsAfterUpload: true },
    // Disable sending data to Sentry
    telemetry: false,
    // Mark first-party bundles for thirdPartyErrorFilterIntegration
    _experimental: {
        turbopackApplicationKey: 'aragon-app',
    },
};

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: [
            '@aragon/gov-ui-kit',
            'framer-motion',
            'luxon',
            'recharts',
            'viem',
            'viem/chains',
            'wagmi',
            '@reown/appkit',
            '@reown/appkit/react',
            '@tanstack/react-query',
            '@floating-ui/react',
        ],
    },
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
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload',
                    },
                    // Explicitly disable all web functionalities
                    {
                        key: 'Permissions-Policy',
                        value: webFunctionalities.join(', '),
                    },
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
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: process.env.NEXT_PUBLIC_API_ALLOWED_DOMAIN,
                    },
                    { key: 'Access-Control-Allow-Methods', value: 'POST' },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'Content-Type',
                    },
                ],
            },
        ];
    },
    images: {
        minimumCacheTTL: 2_592_000, // 30 days — IPFS content is immutable (CID-addressed)
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
                port: '',
            },
        ],
    },
    env: {
        version: packageInfo.version,
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.optimization.splitChunks = {
                ...config.optimization.splitChunks,
                cacheGroups: {
                    ...config.optimization.splitChunks?.cacheGroups,
                    web3: {
                        test: /[\\/]node_modules[\\/](wagmi|viem|@reown|@walletconnect)[\\/]/,
                        name: 'vendor-web3',
                        chunks: 'all',
                        priority: 30,
                    },
                    charts: {
                        test: /[\\/]node_modules[\\/](recharts|d3-)[\\/]/,
                        name: 'vendor-charts',
                        chunks: 'all',
                        priority: 25,
                    },
                },
            };
        }
        return config;
    },
    serverExternalPackages: ['pino-pretty', 'lokijs', 'encoding'],
    reactCompiler: false,
    turbopack: {
        resolveAlias: {
            '@react-native-async-storage/async-storage': {
                browser: './src/empty.ts',
            },
            'react-native': { browser: './src/empty.ts' },
        },
    },
};

export default withSentryConfig(nextConfig, sentryConfig);
