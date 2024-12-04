import BundleAnalyzer from '@next/bundle-analyzer';
import packageInfo from './package.json' with { type: 'json' };

const withBundleAnalyzer = BundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

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
