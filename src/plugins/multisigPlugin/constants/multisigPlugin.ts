import { Network } from '@/shared/api/daoService';
import type { IPluginInfo } from '@/shared/types';

export const multisigPlugin: IPluginInfo = {
    id: 'multisig',
    name: 'Multisig',
    installVersion: { release: 1, build: 3 },
    repositoryAddresses: {
        [Network.ARBITRUM_MAINNET]: '0x7553E6Fb020c5740768cF289e603770AA09b7aE2',
        [Network.BASE_MAINNET]: '0xcDC4b0BC63AEfFf3a7826A19D101406C6322A585',
        [Network.ETHEREUM_MAINNET]: '0x8c278e37D0817210E18A7958524b7D0a1fAA6F7b',
        [Network.ETHEREUM_SEPOLIA]: '0x08db1fdA5a886f642704164c0036766e8143DACd',
        [Network.POLYGON_MAINNET]: '0x5A5035E7E8aeff220540F383a9cf8c35929bcF31',
        [Network.ZKSYNC_MAINNET]: '0x83f88d380073c8F929fAB649F3d016649c101D3A',
        [Network.ZKSYNC_SEPOLIA]: '0x2cae809b6ca149b49cBcA8B887Da2805174052F3',
        [Network.PEAQ_MAINNET]: '0x83a977d564349586936f17D9536b2c5702B4Fe20',
    },
    setup: {
        nameKey: 'app.plugins.multisig.setup.name',
        descriptionKey: 'app.plugins.multisig.setup.description',
    },
};
