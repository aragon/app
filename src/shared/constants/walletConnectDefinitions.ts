export const walletConnectDefinitions = {
    // WalletConnect project ID.
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,

    // Metadata used during the wallet connection flow and the dApp connect feature.
    metadata: {
        name: 'Aragon App',
        description: 'Aragon App',
        url: 'https://app-next.aragon.org/',
        icons: ['https://app-next.aragon.org/icon.svg'],
    },
};
