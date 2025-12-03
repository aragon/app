import { Network } from '@/shared/api/daoService';
import type { Hex } from 'viem';

export const capitalFlowAddresses: Record<Network, Record<string, Hex>> = {
    [Network.ARBITRUM_MAINNET]: {
        // model factories
        routerModelFactory: '0x0000000000000000000000000000000000000000',
        omniModelFactory: '0x0000000000000000000000000000000000000000',
        // source factories
        routerSourceFactory: '0x0000000000000000000000000000000000000000',
        claimerSourceFactory: '0x0000000000000000000000000000000000000000',
        omniSourceFactory: '0x0000000000000000000000000000000000000000',
        // plugin repos
        routerPluginRepo: '0x0000000000000000000000000000000000000000',
        claimerPluginRepo: '0x0000000000000000000000000000000000000000',
        burnRouterPluginRepo: '0x0000000000000000000000000000000000000000',
    },
    [Network.BASE_MAINNET]: {
        // model factories
        routerModelFactory: '0x0000000000000000000000000000000000000000',
        omniModelFactory: '0x0000000000000000000000000000000000000000',
        // source factories
        routerSourceFactory: '0x0000000000000000000000000000000000000000',
        claimerSourceFactory: '0x0000000000000000000000000000000000000000',
        omniSourceFactory: '0x0000000000000000000000000000000000000000',
        // plugin repos
        routerPluginRepo: '0x0000000000000000000000000000000000000000',
        claimerPluginRepo: '0x0000000000000000000000000000000000000000',
        burnRouterPluginRepo: '0x0000000000000000000000000000000000000000',
    },
    [Network.ETHEREUM_MAINNET]: {
        // model factories
        routerModelFactory: '0x0000000000000000000000000000000000000000',
        omniModelFactory: '0x0000000000000000000000000000000000000000',
        // source factories
        routerSourceFactory: '0x0000000000000000000000000000000000000000',
        claimerSourceFactory: '0x0000000000000000000000000000000000000000',
        omniSourceFactory: '0x0000000000000000000000000000000000000000',
        // plugin repos
        routerPluginRepo: '0x0000000000000000000000000000000000000000',
        claimerPluginRepo: '0x0000000000000000000000000000000000000000',
        burnRouterPluginRepo: '0x0000000000000000000000000000000000000000',
    },
    [Network.ETHEREUM_SEPOLIA]: {
        // model factories
        routerModelFactory: '0xDC092C9f4c5196De1ee7FeE3B8eea2A75a44f64d',
        omniModelFactory: '0xcB3Ce8f3450BB65ebe5EAE0144ecE47814C1fA47',
        // source factories
        routerSourceFactory: '0x2C52582d49D530e8C0973c07f5c2A3e688697E0C',
        claimerSourceFactory: '0x1134703E2a6713c1bC43DF35A08d82A8A1e59b11',
        omniSourceFactory: '0xEB9e27056cBfD6E1a22ee051a44787Cf2FBbe911',
        // plugin repos
        routerPluginRepo: '0x1bd5970DCEB7168c65b1A226ED71Fb632c3Def47',
        claimerPluginRepo: '0x70f636D481898E897FceDB182074eF61e05FbbD0',
        burnRouterPluginRepo: '0x42718AB262073EFFB1AC6d538a4BD6717039d4b3',
    },
    [Network.POLYGON_MAINNET]: {
        // model factories
        routerModelFactory: '0x0000000000000000000000000000000000000000',
        omniModelFactory: '0x0000000000000000000000000000000000000000',
        // source factories
        routerSourceFactory: '0x0000000000000000000000000000000000000000',
        claimerSourceFactory: '0x0000000000000000000000000000000000000000',
        omniSourceFactory: '0x0000000000000000000000000000000000000000',
        // plugin repos
        routerPluginRepo: '0x0000000000000000000000000000000000000000',
        claimerPluginRepo: '0x0000000000000000000000000000000000000000',
        burnRouterPluginRepo: '0x0000000000000000000000000000000000000000',
    },
    [Network.ZKSYNC_MAINNET]: {
        // model factories
        routerModelFactory: '0x0000000000000000000000000000000000000000',
        omniModelFactory: '0x0000000000000000000000000000000000000000',
        // source factories
        routerSourceFactory: '0x0000000000000000000000000000000000000000',
        claimerSourceFactory: '0x0000000000000000000000000000000000000000',
        omniSourceFactory: '0x0000000000000000000000000000000000000000',
        // plugin repos
        routerPluginRepo: '0x0000000000000000000000000000000000000000',
        claimerPluginRepo: '0x0000000000000000000000000000000000000000',
        burnRouterPluginRepo: '0x0000000000000000000000000000000000000000',
    },
    [Network.ZKSYNC_SEPOLIA]: {
        // model factories
        routerModelFactory: '0x0000000000000000000000000000000000000000',
        omniModelFactory: '0x0000000000000000000000000000000000000000',
        // source factories
        routerSourceFactory: '0x0000000000000000000000000000000000000000',
        claimerSourceFactory: '0x0000000000000000000000000000000000000000',
        omniSourceFactory: '0x0000000000000000000000000000000000000000',
        // plugin repos
        routerPluginRepo: '0x0000000000000000000000000000000000000000',
        claimerPluginRepo: '0x0000000000000000000000000000000000000000',
        burnRouterPluginRepo: '0x0000000000000000000000000000000000000000',
    },
    [Network.PEAQ_MAINNET]: {
        // model factories
        routerModelFactory: '0x0000000000000000000000000000000000000000',
        omniModelFactory: '0x0000000000000000000000000000000000000000',
        // source factories
        routerSourceFactory: '0x0000000000000000000000000000000000000000',
        claimerSourceFactory: '0x0000000000000000000000000000000000000000',
        omniSourceFactory: '0x0000000000000000000000000000000000000000',
        // plugin repos
        routerPluginRepo: '0x0000000000000000000000000000000000000000',
        claimerPluginRepo: '0x0000000000000000000000000000000000000000',
        burnRouterPluginRepo: '0x0000000000000000000000000000000000000000',
    },
    [Network.OPTIMISM_MAINNET]: {
        // model factories
        routerModelFactory: '0x0000000000000000000000000000000000000000',
        omniModelFactory: '0x0000000000000000000000000000000000000000',
        // source factories
        routerSourceFactory: '0x0000000000000000000000000000000000000000',
        claimerSourceFactory: '0x0000000000000000000000000000000000000000',
        omniSourceFactory: '0x0000000000000000000000000000000000000000',
        // plugin repos
        routerPluginRepo: '0x0000000000000000000000000000000000000000',
        claimerPluginRepo: '0x0000000000000000000000000000000000000000',
        burnRouterPluginRepo: '0x0000000000000000000000000000000000000000',
    },
    [Network.CORN_MAINNET]: {
        // model factories
        routerModelFactory: '0x0000000000000000000000000000000000000000',
        omniModelFactory: '0x0000000000000000000000000000000000000000',
        // source factories
        routerSourceFactory: '0x0000000000000000000000000000000000000000',
        claimerSourceFactory: '0x0000000000000000000000000000000000000000',
        omniSourceFactory: '0x0000000000000000000000000000000000000000',
        // plugin repos
        routerPluginRepo: '0x0000000000000000000000000000000000000000',
        claimerPluginRepo: '0x0000000000000000000000000000000000000000',
        burnRouterPluginRepo: '0x0000000000000000000000000000000000000000',
    },
    [Network.CHILIZ_MAINNET]: {
        // model factories
        routerModelFactory: '0x0000000000000000000000000000000000000000',
        omniModelFactory: '0x0000000000000000000000000000000000000000',
        // source factories
        routerSourceFactory: '0x0000000000000000000000000000000000000000',
        claimerSourceFactory: '0x0000000000000000000000000000000000000000',
        omniSourceFactory: '0x0000000000000000000000000000000000000000',
        // plugin repos
        routerPluginRepo: '0x0000000000000000000000000000000000000000',
        claimerPluginRepo: '0x0000000000000000000000000000000000000000',
        burnRouterPluginRepo: '0x0000000000000000000000000000000000000000',
    },
    [Network.AVAX_MAINNET]: {
        // model factories
        routerModelFactory: '0x0000000000000000000000000000000000000000',
        omniModelFactory: '0x0000000000000000000000000000000000000000',
        // source factories
        routerSourceFactory: '0x0000000000000000000000000000000000000000',
        claimerSourceFactory: '0x0000000000000000000000000000000000000000',
        omniSourceFactory: '0x0000000000000000000000000000000000000000',
        // plugin repos
        routerPluginRepo: '0x0000000000000000000000000000000000000000',
        claimerPluginRepo: '0x0000000000000000000000000000000000000000',
        burnRouterPluginRepo: '0x0000000000000000000000000000000000000000',
    },
    [Network.KATANA_MAINNET]: {
        // model factories
        routerModelFactory: '0x0000000000000000000000000000000000000000',
        omniModelFactory: '0x0000000000000000000000000000000000000000',
        // source factories
        routerSourceFactory: '0x0000000000000000000000000000000000000000',
        claimerSourceFactory: '0x0000000000000000000000000000000000000000',
        omniSourceFactory: '0x0000000000000000000000000000000000000000',
        // plugin repos
        routerPluginRepo: '0x0000000000000000000000000000000000000000',
        claimerPluginRepo: '0x0000000000000000000000000000000000000000',
        burnRouterPluginRepo: '0x0000000000000000000000000000000000000000',
    },
} as const;
