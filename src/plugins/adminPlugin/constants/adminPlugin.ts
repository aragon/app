import { Network } from '@/shared/api/daoService';
import type { IPluginInfo } from '@/shared/types';
import { zeroAddress } from 'viem';

export const adminPlugin: IPluginInfo = {
    id: 'admin',
    name: 'Admin',
    installVersion: { release: 1, build: 2 },
    repositoryAddresses: {
        [Network.ARBITRUM_MAINNET]: zeroAddress,
        [Network.BASE_MAINNET]: zeroAddress,
        [Network.ETHEREUM_MAINNET]: zeroAddress,
        [Network.ETHEREUM_SEPOLIA]: '0x152c9E28995E418870b85cbbc0AEE4e53020edb2',
        [Network.POLYGON_MAINNET]: zeroAddress,
        [Network.ZKSYNC_MAINNET]: zeroAddress,
        [Network.ZKSYNC_SEPOLIA]: zeroAddress,
        [Network.PEAQ_MAINNET]: '0x86C87Aa7C09a447048adf4197fec7C12eF62A07F',
    },
};
