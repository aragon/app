import { authConnector, createWeb3Modal } from '@web3modal/wagmi';
import { Chain, createClient } from 'viem';
import { cookieStorage, createConfig, createStorage, http } from 'wagmi';
import { arbitrum, base, mainnet, polygon, sepolia, zkSync, zkSyncSepoliaTestnet } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';

// Metadata used during wallet connection process.
const AppMetadata = {
    name: 'Aragon App',
    description: 'Aragon App - Next',
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
        walletConnect({ projectId, metadata: AppMetadata, showQrModal: false }),
        injected({ shimDisconnect: false }),
        coinbaseWallet({ appName: AppMetadata.name, appLogoUrl: AppMetadata.icons[0] }),
        authConnector({ chains, options: { projectId }, email: true, showWallets: true, walletFeatures: true }),
    ],
    storage: createStorage({ storage: cookieStorage }),
});

// Initialize web3-modal
createWeb3Modal({ metadata: AppMetadata, wagmiConfig: wagmiConfig, projectId });
