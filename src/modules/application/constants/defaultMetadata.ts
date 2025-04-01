import type { Metadata } from 'next/types';

export const defaultMetadata: Metadata = {
    title: 'Aragon App, DAO creation and management platform',
    description:
        'Aragon App is a human-centered platform for creating and managing DAOs. Designed for usability, backed by a modular and robust core.',
    authors: [
        {
            name: 'Aragon',
            url: 'https://app.aragon.org',
        },
    ],
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://app.aragon.org',
        title: 'Aragon App, DAO creation and management platform',
        description:
            'Aragon App is a human-centered platform for creating and managing DAOs. Designed for usability, backed by a modular and robust core.',
        siteName: 'Aragon',
        images: [
            {
                url: '/og-share-large.png',
                width: 1200,
                height: 630,
                alt: 'Aragon Logo',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@AragonProject',
        title: 'Aragon App, DAO creation and management platform',
        description:
            'Aragon App is a human-centered platform for creating and managing DAOs. Designed for usability, backed by a modular and robust core.',
        images: ['/og-share-large.png'],
    },
};
