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
            daoFactory: 0x35B62715459cB60bf6dC17fF8cfe138EA305E7Ee,
            pluginSetupProcessor: 0x08633901DdF9cD8e2DC3a073594d0A7DaD6f3f57,
            globalExecutor: 0x07f49c49Ce2A99CF7C28F66673d406386BDD8Ff4,
        },
    },

    // Testnets
    [Network.ETHEREUM_SEPOLIA]: {
        ...sepolia,
        name: 'Ethereum Sepolia',
        logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        privateRpc: 'https://eth-sepolia.g.alchemy.com/v2/',
        addresses: {
            daoFactory: '0xB815791c233807D39b7430127975244B36C19C8e',
            pluginSetupProcessor: '0xC24188a73dc09aA7C721f96Ad8857B469C01dC9f',
            globalExecutor: '0x619c4C957370CD288D64b46D4cF3a560229b593b',
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
