import { Network } from '@/shared/api/daoService';
import type { IPluginInfo } from '@/shared/types';

export const sppPlugin: IPluginInfo = {
    id: 'spp',
    name: 'Staged Proposal Processor',
    installVersion: { release: 1, build: 1 },
    repositoryAddresses: {
        [Network.ARBITRUM_MAINNET]: '0xe3B00403Cd8cBee7af01961c25220289a4Cc5753',
        [Network.BASE_MAINNET]: '0x3C13098D4e2FE9aCb2fCEb3EE4fBBe33405eD39D',
        [Network.ETHEREUM_MAINNET]: '0x421FF506E4DC17356965565688D62b55Bf2bf0a5',
        [Network.ETHEREUM_SEPOLIA]: '0xda62D32C14E8CA78958d6fdC0142A575b0cd6Ad4',
        [Network.POLYGON_MAINNET]: '0xc36fE143bd829a80df458Bd9ab52299Df985DC6F',
        [Network.ZKSYNC_MAINNET]: '0xE294451cB4B7aA4a8136dA6474b8b4C6C5a69973',
        [Network.ZKSYNC_SEPOLIA]: '0xf5aF03C238F1f6803F783125e33C763057C7781D',
        [Network.PEAQ_MAINNET]: '0x2784e9500f8f60C1267e819f216682a88A37d56D',
    },
};
