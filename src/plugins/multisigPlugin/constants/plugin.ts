import { Network } from '@/shared/api/daoService';
import type { IPlugin } from '@/shared/utils/pluginRegistryUtils';
import { zeroAddress } from 'viem';

export const plugin: IPlugin = {
    id: 'multisig',
    name: 'Multisig',
    installVersion: { release: 1, build: 5 },
    repositoryAddresses: {
        [Network.ARBITRUM_MAINNET]: zeroAddress,
        [Network.BASE_MAINNET]: zeroAddress,
        [Network.ETHEREUM_MAINNET]: zeroAddress,
        [Network.ETHEREUM_SEPOLIA]: '0xA0901B5BC6e04F14a9D0d094653E047644586DdE',
        [Network.POLYGON_MAINNET]: zeroAddress,
        [Network.ZKSYNC_MAINNET]: zeroAddress,
        [Network.ZKSYNC_SEPOLIA]: zeroAddress,
    },
};
