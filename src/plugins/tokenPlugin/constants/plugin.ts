import { Network } from '@/shared/api/daoService';
import type { IPlugin } from '@/shared/utils/pluginRegistryUtils';
import { zeroAddress } from 'viem';

export const plugin: IPlugin = {
    id: 'token-voting',
    name: 'Token',
    installVersion: { release: 1, build: 5 },
    repositoryAddresses: {
        [Network.ARBITRUM_MAINNET]: zeroAddress,
        [Network.BASE_MAINNET]: zeroAddress,
        [Network.ETHEREUM_MAINNET]: zeroAddress,
        [Network.ETHEREUM_SEPOLIA]: '0x6241ad0D3f162028d2e0000f1A878DBc4F5c4aD0',
        [Network.POLYGON_MAINNET]: zeroAddress,
        [Network.ZKSYNC_MAINNET]: zeroAddress,
        [Network.ZKSYNC_SEPOLIA]: zeroAddress,
    },
};
