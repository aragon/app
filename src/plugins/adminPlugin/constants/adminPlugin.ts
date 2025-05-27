import { Network } from '@/shared/api/daoService';
import type { IPluginInfo } from '@/shared/types';

export const adminPlugin: IPluginInfo = {
    id: 'admin',
    name: 'Admin',
    installVersion: {
        release: 1,
        build: 2,
        releaseNotes: 'https://github.com/aragon/admin-plugin/releases/tag/v1.2.0',
        description:
            'This optional upgrade adds minor extensions to the contract interfaces to ensure consistency with other plugins.',
    },
    repositoryAddresses: {
        [Network.ARBITRUM_MAINNET]: '0x326A2aee6A8eE78D79E7E956DE60C6E452f76a8e',
        [Network.BASE_MAINNET]: '0x212eF339C77B3390599caB4D46222D79fAabcb5c',
        [Network.ETHEREUM_MAINNET]: '0xA4371a239D08bfBA6E8894eccf8466C6323A52C3',
        [Network.ETHEREUM_SEPOLIA]: '0x152c9E28995E418870b85cbbc0AEE4e53020edb2',
        [Network.POLYGON_MAINNET]: '0x7fF570473d0876db16A59e8F04EE7F17Ab117309',
        [Network.ZKSYNC_MAINNET]: '0x2BAb29B3483F8972f6112c68a4076e79c3035E02',
        [Network.ZKSYNC_SEPOLIA]: '0x2e23fD7985979AE78561adD5D76d2fa10f20fbB1',
        [Network.PEAQ_MAINNET]: '0x86C87Aa7C09a447048adf4197fec7C12eF62A07F',
        [Network.OPTIMISM_MAINNET]: '0x35B21E1B431299c57678E6bA3274389Fe9c6f02C',
    },
};
