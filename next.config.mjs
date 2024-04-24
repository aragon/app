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
    experimental: {
        typedRoutes: true,
    },
};

export default withBundleAnalyzer(nextConfig);
