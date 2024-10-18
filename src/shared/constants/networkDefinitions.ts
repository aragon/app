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
}

export const networkDefinitions: Record<Network, INetworkDefinition> = {
    [Network.ETHEREUM_MAINNET]: {
        chainId: 1,
        name: 'Ethereum Mainnet',
        logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    },
    [Network.ETHEREUM_SEPOLIA]: {
        chainId: 11155111,
        name: 'Ethereum Sepolia',
        logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    },
    [Network.POLYGON_MAINNET]: {
        chainId: 137,
        name: 'Polygon Mainnet',
        logo: 'https://assets.coingecko.com/coins/images/4713/large/polygon.png',
    },
    [Network.BASE_MAINNET]: {
        chainId: 8453,
        name: 'Base Mainnet',
        logo: 'https://mirror-media.imgix.net/publication-images/cgqxxPdUFBDjgKna_dDir.png?h=250&w=250',
    },
    [Network.ARBITRUM_MAINNET]: {
        chainId: 42161,
        name: 'Arbitrum Mainnet',
        logo: 'https://docs.arbitrum.io/img/logo.svg',
    },
    [Network.ZKSYNC_MAINNET]: {
        chainId: 324,
        name: 'zkSync Mainnet',
        logo: 'https://assets.coingecko.com/coins/images/38043/large/ZKTokenBlack.png',
    },
    [Network.ZKSYNC_SEPOLIA]: {
        chainId: 300,
        name: 'zkSync Sepolia',
        logo: 'https://assets.coingecko.com/coins/images/38043/large/ZKTokenBlack.png',
    },
};
