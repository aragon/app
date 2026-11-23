import { metadataUtils } from '@/shared/utils/metadataUtils';

const appOrigin = globalThis.location?.origin ?? metadataUtils.baseUrl;

export const walletConnectDefinitions = {
    // WalletConnect project ID.
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,

    // Metadata used during the wallet connection flow and the dApp connect feature.
    metadata: {
        name: 'Aragon App',
        description: 'Aragon App',
        url: appOrigin,
        icons: [`${appOrigin}/icon.svg`],
    },
};
