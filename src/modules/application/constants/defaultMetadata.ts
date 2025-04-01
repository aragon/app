import type { Metadata } from 'next/types';

const baseTitle = 'Aragon App, DAO creation and management platform';
const baseDescription =
    'Aragon App is the long awaited human-centered approach to DAOs. A huge evolution when it comes to user experience in web3, backed by a strong and modular core.';
const baseUrl = 'https://app.aragon.org';
const imageUrl = '/og-share-large.png';

export const defaultMetadata: Metadata = {
    title: baseTitle,
    description: baseDescription,
    authors: [
        {
            name: 'Aragon',
            url: baseUrl,
        },
    ],
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: baseUrl,
        title: baseTitle,
        description: baseDescription,
        siteName: 'Aragon',
        images: [
            {
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: 'Aragon Logo',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@AragonProject',
        title: baseTitle,
        description: baseDescription,
        images: [imageUrl],
    },
};
