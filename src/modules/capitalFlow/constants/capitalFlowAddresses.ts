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
        routerPluginRepo: '0x56c3b53f3bA2dD907E67AdC7536480F81a886C35',
        claimerPluginRepo: '0x71d769312A4eC1B6f418A88a6450BD39c58A1159',
        burnRouterPluginRepo: '0x985323bA031F640B52EC0505b1E84D3279dc54a5',
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
} as const;
