import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { type Chain, createClient } from 'viem';
import { cookieStorage, createConfig, createStorage, http } from 'wagmi';
import { arbitrum, base, mainnet, polygon, sepolia, zksync, zksyncSepoliaTestnet } from 'wagmi/chains';
import { coinbaseWallet, walletConnect } from 'wagmi/connectors';

// Metadata used during wallet connection process.
const appMetadata = {
    name: 'Aragon App',
    description: 'Aragon App',
    url: 'https://dev-app-next.vercel.app/',
    icons: ['https://dev-app-next.vercel.app/icon.svg'],
};

// Supported chains by the Application.
const chains: [Chain, ...Chain[]] = [arbitrum, base, mainnet, polygon, sepolia, zksync, zksyncSepoliaTestnet];

// WalletConnect project ID.
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!;

// Wagmi configuration for the Application.
export const wagmiConfig = createConfig({
    chains,
    client: ({ chain }) => {
        const network = Object.values(Network).find(
            (network) => networkDefinitions[network as Network].chainId === chain.id,
        )!;
        const rpcEndpoint = `${networkDefinitions[network].rpc}${process.env.NEXT_PUBLIC_RPC_KEY!}`;

        return createClient({ chain, transport: http(rpcEndpoint) });
    },
    ssr: true,
    connectors: [
        walletConnect({ projectId, metadata: appMetadata, showQrModal: false }),
        coinbaseWallet({ appName: appMetadata.name, appLogoUrl: appMetadata.icons[0] }),
    ],
    storage: createStorage({ storage: cookieStorage }),
});

// Initialize web3-modal for wallet connection.
createWeb3Modal({
    metadata: appMetadata,
    wagmiConfig,
    projectId,
    themeMode: 'light',
    featuredWalletIds: [
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
        '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
        '18388be9ac2d02726dbac9777c96efaac06d744b2f6d580fccdd4127a6d01fd1', // Rabby
    ],
    themeVariables: {
        '--w3m-font-family': 'var(--guk-font-family)',
        '--w3m-accent': 'var(--guk-color-primary-400)',
        '--w3m-color-mix': 'var(--guk-color-neutral-100)',
        '--w3m-border-radius-master': '1.3px',
    },
});
