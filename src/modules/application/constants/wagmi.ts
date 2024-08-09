import { authConnector } from '@web3modal/wagmi';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { type Chain, createClient } from 'viem';
import { cookieStorage, createConfig, createStorage, http } from 'wagmi';
import { arbitrum, base, mainnet, polygon, sepolia, zkSync, zkSyncSepoliaTestnet } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';

// Metadata used during wallet connection process.
const appMetadata = {
    name: 'Aragon App',
    description: 'Aragon App',
    url: 'https://dev-app-next.vercel.app/',
    icons: ['https://dev-app-next.vercel.app/icon.svg'],
};

// Supported chains by the Application.
const chains: [Chain, ...Chain[]] = [arbitrum, base, mainnet, polygon, sepolia, zkSync, zkSyncSepoliaTestnet];

// WalletConnect project ID.
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!;

// Wagmi configuration for the Application.
export const wagmiConfig = createConfig({
    chains,
    client: ({ chain }) => createClient({ chain, transport: http() }),
    ssr: true,
    connectors: [
        walletConnect({ projectId, metadata: appMetadata, showQrModal: false }),
        injected({ shimDisconnect: false }),
        coinbaseWallet({ appName: appMetadata.name, appLogoUrl: appMetadata.icons[0] }),
        authConnector({ chains, options: { projectId }, email: true, showWallets: true, walletFeatures: true }),
    ],
    storage: createStorage({ storage: cookieStorage }),
});

// Initialize web3-modal for wallet connection.
createWeb3Modal({
    metadata: appMetadata,
    wagmiConfig,
    projectId,
    themeMode: 'light',
    themeVariables: {
        '--w3m-font-family': 'var(--ods-font-family)',
        '--w3m-accent': 'var(--ods-color-primary-400)',
        '--w3m-color-mix': 'var(--ods-color-neutral-100)',
        '--w3m-border-radius-master': '1.3px',
    },
});
