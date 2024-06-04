import BundleAnalyzer from '@next/bundle-analyzer';
import packageInfo from './package.json' assert { type: 'json' };

const withBundleAnalyzer = BundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            {
                source: '/dao/:slug',
                destination: '/dao/:slug/dashboard',
                permanent: true,
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'aragon-1.mypinata.cloud',
                port: '',
                pathname: '/ipfs/**',
            },
        ],
    },
    experimental: {
        typedRoutes: true,
    },
    env: {
        version: packageInfo.version,
    },
};

export default withBundleAnalyzer(nextConfig);
