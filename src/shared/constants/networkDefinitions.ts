import { Network } from '@/shared/api/daoService';
import type { Chain, Hex } from 'viem';
import { arbitrum, base, mainnet, peaq, polygon, sepolia, zksync, zksyncSepoliaTestnet } from 'wagmi/chains';
import type { IVersion } from '../utils/versionComparatorUtils';

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
    /**
     * Latest version of the OSx framework.
     */
    protocolVersion: IVersion;
    /**
     * Order of the network in the network selection.
     */
    order: number;
    /**
     * Wheter the network has beta support or not.
     */
    beta?: boolean;
    /**
     * Whether the network is disabled in DAO creation.
     */
    disabled?: boolean;
}

const latestProtocolVersion: IVersion = { build: 1, release: 4 };

export const networkDefinitions: Record<Network, INetworkDefinition> = {
    // Mainnets
    [Network.ETHEREUM_MAINNET]: {
        ...mainnet,
        name: 'Ethereum',
        logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        privateRpc: 'https://eth-mainnet.g.alchemy.com/v2/',
        order: 1,
        protocolVersion: latestProtocolVersion,
        addresses: {
            daoFactory: '0x246503df057A9a85E0144b6867a828c99676128B',
            pluginSetupProcessor: '0xE978942c691e43f65c1B7c7F8f1dc8cDF061B13f',
            globalExecutor: '0x56ce4D8006292Abf418291FaE813C1E3769240A4',
        },
    },
    [Network.POLYGON_MAINNET]: {
        ...polygon,
        name: 'Polygon',
        logo: 'https://assets.coingecko.com/coins/images/4713/large/polygon.png',
        privateRpc: 'https://polygon-mainnet.g.alchemy.com/v2/',
        order: 2,
        protocolVersion: latestProtocolVersion,
        addresses: {
            daoFactory: '0x9BC7f1dc3cFAD56a0EcD924D1f9e70f5C7aF0039',
            pluginSetupProcessor: '0x879D9dfe3F36d7684BeC1a2bB4Aa8E8871A7245B',
            globalExecutor: '0xD24Bdf1573605C3Df87430F240cB580015f197B5',
        },
    },
    [Network.BASE_MAINNET]: {
        ...base,
        name: 'Base',
        logo: 'https://mirror-media.imgix.net/publication-images/cgqxxPdUFBDjgKna_dDir.png?h=250&w=250',
        privateRpc: 'https://base-mainnet.g.alchemy.com/v2/',
        order: 3,
        protocolVersion: latestProtocolVersion,
        addresses: {
            daoFactory: '0xcc602EA573a42eBeC290f33F49D4A87177ebB8d2',
            pluginSetupProcessor: '0x91a851E9Ed7F2c6d41b15F76e4a88f5A37067cC9',
            globalExecutor: '0x304eBcA6a98F3a2d4424388814ddbFf8904Bd1cE',
        },
    },
    [Network.ARBITRUM_MAINNET]: {
        ...arbitrum,
        name: 'Arbitrum',
        logo: 'https://docs.arbitrum.io/img/logo.svg',
        privateRpc: 'https://arb-mainnet.g.alchemy.com/v2/',
        order: 4,
        protocolVersion: latestProtocolVersion,
        addresses: {
            daoFactory: '0x49e04AB7af7A263b8ac802c1cAe22f5b4E4577Cd',
            pluginSetupProcessor: '0x308a1DC5020c4B5d992F5543a7236c465997fecB',
            globalExecutor: '0x198b64a53b39f454e56626d9262cBf67E7C13138',
        },
    },
    [Network.ZKSYNC_MAINNET]: {
        ...zksync,
        name: 'zkSync',
        logo: 'https://assets.coingecko.com/coins/images/38043/large/ZKTokenBlack.png',
        privateRpc: 'https://zksync-mainnet.g.alchemy.com/v2/',
        order: 5,
        protocolVersion: latestProtocolVersion,
        addresses: {
            daoFactory: '0x01019505E3B87340d7Fa69EF3E2510A7642f067A',
            pluginSetupProcessor: '0x8E3e98ECF5CdBF2bEcCD91d3BA580D472df5A0cB',
            globalExecutor: '0x581F87d3d3aE015c912Cb6E7B521A130493Cc497',
        },
    },
    [Network.PEAQ_MAINNET]: {
        ...peaq,
        name: 'Peaq',
        logo: 'https://assets.coingecko.com/coins/images/51415/large/peaq-token-brand-icon_%281%29.png',
        order: process.env.NEXT_PUBLIC_FEATURE_NETWORK_PEAQ !== 'true' ? 9 : 6,
        protocolVersion: latestProtocolVersion,
        beta: true,
        disabled: process.env.NEXT_PUBLIC_FEATURE_NETWORK_PEAQ !== 'true',
        addresses: {
            daoFactory: '0x35B62715459cB60bf6dC17fF8cfe138EA305E7Ee',
            pluginSetupProcessor: '0x08633901DdF9cD8e2DC3a073594d0A7DaD6f3f57',
            globalExecutor: '0x07f49c49Ce2A99CF7C28F66673d406386BDD8Ff4',
        },
    },

    // Testnets
    [Network.ETHEREUM_SEPOLIA]: {
        ...sepolia,
        name: 'Ethereum Sepolia',
        logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        privateRpc: 'https://eth-sepolia.g.alchemy.com/v2/',
        order: 0,
        protocolVersion: latestProtocolVersion,
        addresses: {
            daoFactory: '0xB815791c233807D39b7430127975244B36C19C8e',
            pluginSetupProcessor: '0xC24188a73dc09aA7C721f96Ad8857B469C01dC9f',
            globalExecutor: '0x7a20760b89EF507759DD2c5A0d1f1657614341A9',
        },
    },
    [Network.ZKSYNC_SEPOLIA]: {
        ...zksyncSepoliaTestnet,
        name: 'zkSync Sepolia',
        logo: 'https://assets.coingecko.com/coins/images/38043/large/ZKTokenBlack.png',
        privateRpc: 'https://zksync-sepolia.g.alchemy.com/v2/',
        order: 7,
        protocolVersion: latestProtocolVersion,
        addresses: {
            daoFactory: '0xee321f16f7F0a0F0d8b850E70c4eAde4A288ECd7',
            pluginSetupProcessor: '0xe2Ef39f1be2269644cBfa9b70003A143bF1fdf4d',
            globalExecutor: '0x0ED69b3b690e10Fb509FA1b081C1b74EF3FeB36D',
        },
    },
};
