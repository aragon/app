import { Network } from '@/shared/api/daoService';

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
}

export const networkDefinitions: Record<Network, INetworkDefinition> = {
    [Network.ETHEREUM_MAINNET]: {
        chainId: 1,
        name: 'Ethereum',
        logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        rpc: 'https://eth-mainnet.g.alchemy.com/v2/',
    },
    [Network.ETHEREUM_SEPOLIA]: {
        chainId: 11155111,
        name: 'Ethereum Sepolia',
        logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        rpc: 'https://eth-sepolia.g.alchemy.com/v2/',
    },
    [Network.POLYGON_MAINNET]: {
        chainId: 137,
        name: 'Polygon',
        logo: 'https://assets.coingecko.com/coins/images/4713/large/polygon.png',
        rpc: 'https://polygon-mainnet.g.alchemy.com/v2/',
    },
    [Network.BASE_MAINNET]: {
        chainId: 8453,
        name: 'Base',
        logo: 'https://mirror-media.imgix.net/publication-images/cgqxxPdUFBDjgKna_dDir.png?h=250&w=250',
        rpc: 'https://base-mainnet.g.alchemy.com/v2/',
    },
    [Network.ARBITRUM_MAINNET]: {
        chainId: 42161,
        name: 'Arbitrum',
        logo: 'https://docs.arbitrum.io/img/logo.svg',
        rpc: 'https://arb-mainnet.g.alchemy.com/v2/',
    },
    [Network.ZKSYNC_MAINNET]: {
        chainId: 324,
        name: 'zkSync',
        logo: 'https://assets.coingecko.com/coins/images/38043/large/ZKTokenBlack.png',
        rpc: 'https://zksync-mainnet.g.alchemy.com/v2/',
    },
    [Network.ZKSYNC_SEPOLIA]: {
        chainId: 300,
        name: 'zkSync Sepolia',
        logo: 'https://assets.coingecko.com/coins/images/38043/large/ZKTokenBlack.png',
        rpc: 'https://zksync-sepolia.g.alchemy.com/v2/',
    },
};
