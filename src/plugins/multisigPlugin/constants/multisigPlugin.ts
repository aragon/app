import { Network } from '@/shared/api/daoService';
import type { IPluginInfo } from '@/shared/types';
import { zeroAddress } from 'viem';

export const multisigPlugin: IPluginInfo = {
    id: 'multisig',
    name: 'Multisig',
    installVersion: { release: 1, build: 3 },
    repositoryAddresses: {
        [Network.ARBITRUM_MAINNET]: zeroAddress,
        [Network.BASE_MAINNET]: zeroAddress,
        [Network.ETHEREUM_MAINNET]: zeroAddress,
        [Network.ETHEREUM_SEPOLIA]: '0x9e7956C8758470dE159481e5DD0d08F8B59217A2',
        [Network.POLYGON_MAINNET]: zeroAddress,
        [Network.ZKSYNC_MAINNET]: zeroAddress,
        [Network.ZKSYNC_SEPOLIA]: '0x2cae809b6ca149b49cBcA8B887Da2805174052F3',
        [Network.PEAQ_MAINNET]: '0x83a977d564349586936f17D9536b2c5702B4Fe20',
    },
};
