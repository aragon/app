import { Network } from '@/shared/api/daoService';
import type { IPluginInfo } from '@/shared/types';
import { zeroAddress } from 'viem';

export const tokenPlugin: IPluginInfo = {
    id: 'token-voting',
    name: 'Token',
    installVersion: { release: 1, build: 3 },
    repositoryAddresses: {
        [Network.ARBITRUM_MAINNET]: zeroAddress,
        [Network.BASE_MAINNET]: zeroAddress,
        [Network.ETHEREUM_MAINNET]: zeroAddress,
        [Network.ETHEREUM_SEPOLIA]: '0x424F4cA6FA9c24C03f2396DF0E96057eD11CF7dF',
        [Network.POLYGON_MAINNET]: zeroAddress,
        [Network.ZKSYNC_MAINNET]: zeroAddress,
        [Network.ZKSYNC_SEPOLIA]: '0x1f5f8f677164AA4D9b4465A99D22e1e01dC24160',
        [Network.PEAQ_MAINNET]: '0xFBFbE98845B4E2751a8A004B5A1759e3A278FC68',
    },
};
