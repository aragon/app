import { Network } from '@/shared/api/daoService';
import { zeroAddress, type Chain, type Hex } from 'viem';
import { arbitrum, base, mainnet, peaq, polygon, sepolia, zksync, zksyncSepoliaTestnet } from 'wagmi/chains';

export interface INetworkDefinitionAddresses {
    /**
     * Factory address used for deploying DAOs.
     */
    daoFactory: Hex;
    /**
     * Address of the plugin setup processor.
     */
    pluginSetupProcessor: Hex;
    /**
     * Executor address for SPP sub-plugins.
     */
    globalExecutor: Hex;
}

export interface INetworkDefinition extends Chain {
    /**
     * Name of the network.
     */
    name: string;
    /**
     * Logo of the network.
     */
    logo: string;
    /**
     * URL of the private RPC endpoint to use.
     */
    privateRpc?: string;
    /**
     * Addresses for the network.
     */
    addresses: INetworkDefinitionAddresses;
}

export const networkDefinitions: Record<Network, INetworkDefinition> = {
    // Mainnets
    [Network.ETHEREUM_MAINNET]: {
        ...mainnet,
        name: 'Ethereum',
        logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        privateRpc: 'https://eth-mainnet.g.alchemy.com/v2/',
        addresses: {
            daoFactory: zeroAddress,
            pluginSetupProcessor: zeroAddress,
            globalExecutor: zeroAddress,
        },
    },
    [Network.POLYGON_MAINNET]: {
        ...polygon,
        name: 'Polygon',
        logo: 'https://assets.coingecko.com/coins/images/4713/large/polygon.png',
        privateRpc: 'https://polygon-mainnet.g.alchemy.com/v2/',
        addresses: {
            daoFactory: zeroAddress,
            pluginSetupProcessor: zeroAddress,
            globalExecutor: zeroAddress,
        },
    },
    [Network.BASE_MAINNET]: {
        ...base,
        name: 'Base',
        logo: 'https://mirror-media.imgix.net/publication-images/cgqxxPdUFBDjgKna_dDir.png?h=250&w=250',
        privateRpc: 'https://base-mainnet.g.alchemy.com/v2/',
        addresses: {
            daoFactory: zeroAddress,
            pluginSetupProcessor: zeroAddress,
            globalExecutor: zeroAddress,
        },
    },
    [Network.ARBITRUM_MAINNET]: {
        ...arbitrum,
        name: 'Arbitrum',
        logo: 'https://docs.arbitrum.io/img/logo.svg',
        privateRpc: 'https://arb-mainnet.g.alchemy.com/v2/',
        addresses: {
            daoFactory: zeroAddress,
            pluginSetupProcessor: zeroAddress,
            globalExecutor: zeroAddress,
        },
    },
    [Network.ZKSYNC_MAINNET]: {
        ...zksync,
        name: 'zkSync',
        logo: 'https://assets.coingecko.com/coins/images/38043/large/ZKTokenBlack.png',
        privateRpc: 'https://zksync-mainnet.g.alchemy.com/v2/',
        addresses: {
            daoFactory: zeroAddress,
            pluginSetupProcessor: zeroAddress,
            globalExecutor: zeroAddress,
        },
    },
    [Network.PEAQ_MAINNET]: {
        ...peaq,
        name: 'Peaq',
        logo: 'https://assets.coingecko.com/coins/images/51415/large/peaq-token-brand-icon_%281%29.png',
        addresses: {
            daoFactory: zeroAddress,
            pluginSetupProcessor: zeroAddress,
            globalExecutor: zeroAddress,
        },
    },

    // Testnets
    [Network.ETHEREUM_SEPOLIA]: {
        ...sepolia,
        name: 'Ethereum Sepolia',
        logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        privateRpc: 'https://eth-sepolia.g.alchemy.com/v2/',
        addresses: {
            daoFactory: '0x20A8bDAbF02fcAca65CB799C0ed9CE4Ff25F3a90',
            pluginSetupProcessor: '0x9e99D11b513dD2cc5e117a5793412106502FF04B',
            globalExecutor: '0x67744773b8C29aaDc8a11010C09306c0029219Ff',
        },
    },
    [Network.ZKSYNC_SEPOLIA]: {
        ...zksyncSepoliaTestnet,
        name: 'zkSync Sepolia',
        logo: 'https://assets.coingecko.com/coins/images/38043/large/ZKTokenBlack.png',
        privateRpc: 'https://zksync-sepolia.g.alchemy.com/v2/',
        addresses: {
            daoFactory: zeroAddress,
            pluginSetupProcessor: zeroAddress,
            globalExecutor: zeroAddress,
        },
    },
};
