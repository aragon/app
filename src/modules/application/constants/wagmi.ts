import { type INetworkDefinition, networkDefinitions } from '@/shared/constants/networkDefinitions';
import { walletConnectDefinitions } from '@/shared/constants/walletConnectDefinitions';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { createAppKit } from '@reown/appkit/react';
import { createClient } from 'viem';
import { cookieStorage, createStorage, http } from 'wagmi';
import { ProxyRpcUtils } from '../utils/proxyRpcUtils/proxyRpcUtils';

// Supported chains by the Application.
const chains = Object.values(networkDefinitions) as [INetworkDefinition, ...INetworkDefinition[]];

const getRpcUrl = (chainId: string): string | undefined => {
    // Send the request directly to the RPC endpoint when the request is done on the server side, otherwise proxy
    // it through the /api/rpc NextJs route.
    if (typeof window !== 'undefined') {
        return `/api/rpc/${chainId}`;
    }

    const proxyRpcUtils = new ProxyRpcUtils(); // ProxyRpcUtils throws on client side!

    return proxyRpcUtils.chainIdToRpcEndpoint(chainId);
};

// Wagmi configuration for the Application.
const wagmiAdapter = new WagmiAdapter({
    networks: chains,
    ssr: true,
    client: ({ chain }) => createClient({ chain, transport: http(getRpcUrl(chain.id.toString())) }),
    projectId: walletConnectDefinitions.projectId,
    storage: createStorage({ storage: cookieStorage }),
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

// Initialize web3-modal for wallet connection.
createAppKit({
    adapters: [wagmiAdapter],
    metadata: walletConnectDefinitions.metadata,
    networks: chains,
    projectId: walletConnectDefinitions.projectId,
    allowUnsupportedChain: true,
    themeMode: 'light',
    featuredWalletIds: [
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
        '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
        '18388be9ac2d02726dbac9777c96efaac06d744b2f6d580fccdd4127a6d01fd1', // Rabby
    ],
    features: {
        email: false,
        socials: false,
        analytics: true,
        legalCheckbox: true,
    },
    themeVariables: {
        '--w3m-font-family': 'var(--guk-font-family)',
        '--w3m-accent': 'var(--guk-color-primary-400)',
        '--w3m-color-mix': 'var(--guk-color-neutral-100)',
        '--w3m-border-radius-master': '1.3px',
    },
    privacyPolicyUrl: 'https://www.aragon.org/privacy-policy',
    termsConditionsUrl: 'https://www.aragon.org/terms-and-conditions',
});
