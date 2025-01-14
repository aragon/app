import { Network } from '@/shared/api/daoService';
import type { Chain } from 'viem';
import { arbitrum, base, mainnet, polygon, sepolia, zksync, zksyncSepoliaTestnet } from 'wagmi/chains';

export interface INetworkDefinition {
    /**
     * Chain ID of the network.
     */
    chainId: number;
    /**
     * Name of the network.
     */
    name: string;
    /**
     * Logo of the network.
     */
    logo: string;
    /**
     * URL of the RPC endpoint to use.
     */
    rpc: string;
    /**
     * Flag to determine if the network is testnet
     */
    isTestnet?: boolean;
    /**
     * Wagmi chain configuration.
     */
    wagmiChain: Chain;
}

export const networkDefinitions: Record<Network, INetworkDefinition> = {
    [Network.ETHEREUM_MAINNET]: {
        chainId: 1,
        name: 'Ethereum Mainnet',
        logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        rpc: 'https://eth-mainnet.g.alchemy.com/v2/',
        wagmiChain: mainnet,
    },
    [Network.ETHEREUM_SEPOLIA]: {
        chainId: 11155111,
        name: 'Ethereum Sepolia',
        logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        rpc: 'https://eth-sepolia.g.alchemy.com/v2/',
        isTestnet: true,
        wagmiChain: sepolia,
    },
    [Network.POLYGON_MAINNET]: {
        chainId: 137,
        name: 'Polygon Mainnet',
        logo: 'https://assets.coingecko.com/coins/images/4713/large/polygon.png',
        rpc: 'https://polygon-mainnet.g.alchemy.com/v2/',
        wagmiChain: polygon,
    },
    [Network.BASE_MAINNET]: {
        chainId: 8453,
        name: 'Base Mainnet',
        logo: 'https://mirror-media.imgix.net/publication-images/cgqxxPdUFBDjgKna_dDir.png?h=250&w=250',
        rpc: 'https://base-mainnet.g.alchemy.com/v2/',
        wagmiChain: base,
    },
    [Network.ARBITRUM_MAINNET]: {
        chainId: 42161,
        name: 'Arbitrum Mainnet',
        logo: 'https://docs.arbitrum.io/img/logo.svg',
        rpc: 'https://arb-mainnet.g.alchemy.com/v2/',
        wagmiChain: arbitrum,
    },
    [Network.ZKSYNC_MAINNET]: {
        chainId: 324,
        name: 'zkSync Mainnet',
        logo: 'https://assets.coingecko.com/coins/images/38043/large/ZKTokenBlack.png',
        rpc: 'https://zksync-mainnet.g.alchemy.com/v2/',
        wagmiChain: zksync,
    },
    [Network.ZKSYNC_SEPOLIA]: {
        chainId: 300,
        name: 'zkSync Sepolia',
        logo: 'https://assets.coingecko.com/coins/images/38043/large/ZKTokenBlack.png',
        rpc: 'https://zksync-sepolia.g.alchemy.com/v2/',
        isTestnet: true,
        wagmiChain: zksyncSepoliaTestnet,
    },
};
