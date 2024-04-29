import BundleAnalyzer from '@next/bundle-analyzer';

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
                hostname: 'gateway.pinata.cloud',
                port: '',
                pathname: '/ipfs/**',
            },
        ],
    },
    experimental: {
        typedRoutes: true,
    },
};

export default withBundleAnalyzer(nextConfig);
