import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { createClient } from 'viem';
import { cookieStorage, createStorage, http } from 'wagmi';
import {
    type INetworkDefinition,
    networkDefinitions,
} from '@/shared/constants/networkDefinitions';
import { walletConnectDefinitions } from '@/shared/constants/walletConnectDefinitions';

// Supported chains by the Application.
const chains = Object.values(networkDefinitions) as [
    INetworkDefinition,
    ...INetworkDefinition[],
];

// Wagmi configuration for the Application.
const wagmiAdapter = new WagmiAdapter({
    networks: chains,
    ssr: true,
    client: ({ chain }) =>
        createClient({
            chain,
            transport: http(`/api/rpc/${chain.id.toString()}`),
            // Enables automatic batching of all readContract calls (including ENS
            // resolution from useEnsName / getEnsText) into a single eth_call via
            // the Multicall3 contract. 50 list items = 1 HTTP request instead of 50.
            //
            // Known limitations:
            // - Multicall3 must be deployed on the target chain (available on all major
            //   EVM chains including mainnet, Arbitrum, Base, Polygon, etc.)
            // - simulateContract calls are NOT batched (by viem design)
            // - RPC-level errors inside a batch (e.g. rate-limit 429) may not trigger
            //   retries since the HTTP response is still 200
            batch: { multicall: true },
        }),
    projectId: walletConnectDefinitions.projectId,
    storage: createStorage({ storage: cookieStorage }),
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

// Lazy-initialize AppKit on first use (e.g. when ConnectWalletDialog opens).
// Must be called at module level in the consumer file (not in render or useEffect)
// because useAppKit/useAppKitState hooks require it before they execute, and
// createAppKit triggers state updates that React forbids during render.
let appKitInitialized = false;

export const ensureAppKit = () => {
    if (appKitInitialized) {
        return;
    }
    appKitInitialized = true;

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
            '--w3m-font-family': 'var(--font-sans)',
            '--w3m-accent': 'var(--color-primary-400)',
            '--w3m-color-mix': 'var(--color-neutral-100)',
            '--w3m-border-radius-master': '1.3px',
        },
        privacyPolicyUrl: 'https://www.aragon.org/privacy-policy',
        termsConditionsUrl: 'https://www.aragon.org/terms-and-conditions',
    });
};
