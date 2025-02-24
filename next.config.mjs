import BundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
import packageInfo from './package.json' with { type: 'json' };

const withBundleAnalyzer = BundleAnalyzer({ enabled: process.env.ANALYZE === 'true' && process.env.NEXT_USE_TURBOPACK !== '1' });

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
    org: 'aragonorg',
    project: 'app-next',
    authToken: process.env.NEXT_SECRET_SENTRY_AUTH_TOKEN,
    widenClientFileUpload: true,
    tunnelRoute: '/api/monitoring',
    disableLogger: process.env.NEXT_USE_TURBOPACK === '1',
    release: { name: packageInfo.version },
    sourcemaps: { deleteSourcemapsAfterUpload: true },
    telemetry: false,
    bundleSizeOptimizations: {
        excludeReplayWorker: true,
    },
};

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
            {
                source: '/:path*',
                headers: [
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
                    { key: 'Permissions-Policy', value: webFunctionalities.join(', ') },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-DNS-Prefetch-Control', value: 'on' },
                ],
            },
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
    env: {
        version: packageInfo.version,
    },
    webpack: (config) => {
        if (process.env.NEXT_USE_TURBOPACK === '1') {
            console.warn('TURBOPACK ENABLED: Skipping Webpack changes');
            return config;
        }
        
        if (process.env.NODE_ENV === 'development') {
            console.warn('TURBOPACK DISABLED: Applying Webpack changes');
        }
        
        config.externals.push('pino-pretty', 'lokijs', 'encoding');
        
        return config;
    },
};

export default withSentryConfig(withBundleAnalyzer(nextConfig), sentryConfig);
