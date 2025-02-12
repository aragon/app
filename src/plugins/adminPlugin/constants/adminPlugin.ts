import { Network } from '@/shared/api/daoService';
import type { IPluginInfo } from '@/shared/types';
import { zeroAddress } from 'viem';

export const adminPlugin: IPluginInfo = {
    id: 'admin',
    name: 'Admin',
    installVersion: { release: 1, build: 6 },
    repositoryAddresses: {
        [Network.ARBITRUM_MAINNET]: zeroAddress,
        [Network.BASE_MAINNET]: zeroAddress,
        [Network.ETHEREUM_MAINNET]: zeroAddress,
        [Network.ETHEREUM_SEPOLIA]: '0xEdA3074437375DC71007AFC9D421644656d72287',
        [Network.POLYGON_MAINNET]: zeroAddress,
        [Network.ZKSYNC_MAINNET]: zeroAddress,
        [Network.ZKSYNC_SEPOLIA]: zeroAddress,
    },
};
