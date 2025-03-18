import { Network } from '@/shared/api/daoService';
import type { IPluginInfo } from '@/shared/types';
import { zeroAddress } from 'viem';

export const sppPlugin: IPluginInfo = {
    id: 'spp',
    name: 'Staged Proposal Processor',
    installVersion: { release: 1, build: 1 },
    repositoryAddresses: {
        [Network.ARBITRUM_MAINNET]: zeroAddress,
        [Network.BASE_MAINNET]: zeroAddress,
        [Network.ETHEREUM_MAINNET]: zeroAddress,
        [Network.ETHEREUM_SEPOLIA]: '0xda62D32C14E8CA78958d6fdC0142A575b0cd6Ad4',
        [Network.POLYGON_MAINNET]: zeroAddress,
        [Network.ZKSYNC_MAINNET]: zeroAddress,
        [Network.ZKSYNC_SEPOLIA]: '0xf5aF03C238F1f6803F783125e33C763057C7781D',
        [Network.PEAQ_MAINNET]: '0x2784e9500f8f60C1267e819f216682a88A37d56D',
    },
};
