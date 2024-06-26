import BundleAnalyzer from '@next/bundle-analyzer';
import packageInfo from './package.json' assert { type: 'json' };

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
                hostname: 'aragon-1.mypinata.cloud',
                port: '',
                pathname: '/ipfs/**',
            },
            {
                protocol: 'https',
                hostname: 's2.coinmarketcap.com',
                port: '',
            },
            {
                protocol: 'https',
                hostname: 'i.seadn.io',
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
};

export default withBundleAnalyzer(nextConfig);
