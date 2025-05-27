import { Network } from '@/shared/api/daoService';
import type { Chain, Hex } from 'viem';
import { arbitrum, base, mainnet, optimism, peaq, polygon, sepolia, zksync, zksyncSepoliaTestnet } from 'wagmi/chains';
import type { IContractVersionInfo } from '../types';

export interface INetworkDefinitionAddresses {
    /**
     * Address of the base DAO contract used for OSx updates.
     */
    dao: Hex;
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
    protocolVersion: IContractVersionInfo;
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

const latestProtocolVersion: IContractVersionInfo = {
    release: 1,
    build: 4,
    patch: 0,
    releaseNotes: 'https://github.com/aragon/osx/releases/tag/v1.4.0',
    description:
        "This optional upgrade introduces minor features that make the DAO compatible with the StagedProposalProcessor plugin, enabling complex multi-body governance structures. The upgrade also includes minor bug fixes and ensures full compatibility with Aragon's governance features.",
};

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
            dao: '0x58C1F7Bc62Bb63fb137bc8F6d8ea6321a0501d29',
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
            dao: '0xDC5E714720797Fa0B453Bc9eF5049548C79031C3',
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
            dao: '0xBeb2271224D22BdA388B513268873387E5BfC27f',
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
            dao: '0xc3F1f4d3B4E24b6F019120205e12A01D733BEb55',
            daoFactory: '0x49e04AB7af7A263b8ac802c1cAe22f5b4E4577Cd',
            pluginSetupProcessor: '0x308a1DC5020c4B5d992F5543a7236c465997fecB',
            globalExecutor: '0x198b64a53b39f454e56626d9262cBf67E7C13138',
        },
    },
    [Network.OPTIMISM_MAINNET]: {
        ...optimism,
        name: 'Optimism',
        logo: 'https://www.optimism.io/brand/optimism-logo.svg',
        privateRpc: 'https://opt-mainnet.g.alchemy.com/v2/',
        order: 5,
        protocolVersion: latestProtocolVersion,
        addresses: {
            dao: '0x42D24803D8697050CA59f6E306322eC9fce8D7e9',
            daoFactory: '0xB001Bd6A21056c2a7FB5A5b9005cf896b181e74d',
            pluginSetupProcessor: '0x2379Dc18B4A939a2B76F5c79f58aa49193DA56C2',
            globalExecutor: '0x3A8bd3C4Dd02340868c75b5B671673EA094a75bB',
        },
    },
    [Network.ZKSYNC_MAINNET]: {
        ...zksync,
        name: 'zkSync',
        logo: 'https://assets.coingecko.com/coins/images/38043/large/ZKTokenBlack.png',
        privateRpc: 'https://zksync-mainnet.g.alchemy.com/v2/',
        order: 6,
        protocolVersion: latestProtocolVersion,
        addresses: {
            dao: '0x9B43625b28fa32CaB68d84F1B46E2721DD70Ba42',
            daoFactory: '0x01019505E3B87340d7Fa69EF3E2510A7642f067A',
            pluginSetupProcessor: '0x8E3e98ECF5CdBF2bEcCD91d3BA580D472df5A0cB',
            globalExecutor: '0x581F87d3d3aE015c912Cb6E7B521A130493Cc497',
        },
    },
    [Network.PEAQ_MAINNET]: {
        ...peaq,
        name: 'Peaq',
        logo: 'https://assets.coingecko.com/coins/images/51415/large/peaq-token-brand-icon_%281%29.png',
        order: 7,
        protocolVersion: latestProtocolVersion,
        beta: true,
        addresses: {
            dao: '0xa8a4Dc9B6f16BEe4E527CEA47FBeb6e0802030e1',
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
            dao: '0x824d4AAD1cbF2327c4C429E3c97F968Ee19344F8',
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
        order: 8,
        protocolVersion: latestProtocolVersion,
        addresses: {
            dao: '0x39e836A6c32163733929B213965e3feC0007914a',
            daoFactory: '0xee321f16f7F0a0F0d8b850E70c4eAde4A288ECd7',
            pluginSetupProcessor: '0xe2Ef39f1be2269644cBfa9b70003A143bF1fdf4d',
            globalExecutor: '0x0ED69b3b690e10Fb509FA1b081C1b74EF3FeB36D',
        },
    },
};
