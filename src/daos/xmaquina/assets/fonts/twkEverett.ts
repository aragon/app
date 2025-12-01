import localFont from 'next/font/local';

export const twkEverett = localFont({
    src: [
        {
            path: './TWK Everett Regular/TWKEverett-Regular.woff2',
            weight: '400',
            style: 'normal',
        },
        {
            path: './TWK Everett Regular/TWKEverett-Regular.woff',
            weight: '400',
            style: 'normal',
        },
        {
            path: './TWK Everett Medium/TWKEverett-Medium.woff2',
            weight: '500',
            style: 'normal',
        },
        {
            path: './TWK Everett Medium/TWKEverett-Medium.woff',
            weight: '500',
            style: 'normal',
        },
    ],
    display: 'swap',
});
