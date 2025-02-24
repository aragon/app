import { Network } from '@/shared/api/daoService';
import type { IPluginInfo } from '@/shared/types';
import { zeroAddress } from 'viem';

export const sppPlugin: IPluginInfo = {
    id: 'spp',
    name: 'Staged Proposal Processor',
    installVersion: { release: 1, build: 8 },
    repositoryAddresses: {
        [Network.ARBITRUM_MAINNET]: zeroAddress,
        [Network.BASE_MAINNET]: zeroAddress,
        [Network.ETHEREUM_MAINNET]: zeroAddress,
        [Network.ETHEREUM_SEPOLIA]: '0xE67b8E026d190876704292442A38163Ce6945d6b',
        [Network.POLYGON_MAINNET]: zeroAddress,
        [Network.ZKSYNC_MAINNET]: zeroAddress,
        [Network.ZKSYNC_SEPOLIA]: zeroAddress,
        [Network.PEAQ_MAINNET]: '0x2784e9500f8f60C1267e819f216682a88A37d56D',
    },
};
