import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import type { IPluginInfo } from '@/shared/types';

export const multisigPlugin: IPluginInfo = {
    id: PluginInterfaceType.MULTISIG,
    subdomain: 'multisig',
    name: 'Multisig',
    installVersion: {
        release: 1,
        build: 3,
        releaseNotes: 'https://github.com/aragon/multisig-plugin/releases/tag/v1.3.0',
        description:
            'This optional upgrade introduces minor new features, including the ability to customize metadata for governance plugins.',
    },
    repositoryAddresses: {
        [Network.ARBITRUM_MAINNET]: '0x7553E6Fb020c5740768cF289e603770AA09b7aE2',
        [Network.BASE_MAINNET]: '0xcDC4b0BC63AEfFf3a7826A19D101406C6322A585',
        [Network.ETHEREUM_MAINNET]: '0x8c278e37D0817210E18A7958524b7D0a1fAA6F7b',
        [Network.ETHEREUM_SEPOLIA]: '0x9e7956C8758470dE159481e5DD0d08F8B59217A2',
        [Network.POLYGON_MAINNET]: '0x5A5035E7E8aeff220540F383a9cf8c35929bcF31',
        [Network.ZKSYNC_MAINNET]: '0x83f88d380073c8F929fAB649F3d016649c101D3A',
        [Network.ZKSYNC_SEPOLIA]: '0x2cae809b6ca149b49cBcA8B887Da2805174052F3',
        [Network.PEAQ_MAINNET]: '0x83a977d564349586936f17D9536b2c5702B4Fe20',
        [Network.OPTIMISM_MAINNET]: '0xe903df20cD497F0CC12E870d784aCAd53CC5c9d6',
        [Network.CORN_MAINNET]: '0xf3793d55C5fef8AFB5CDF305996A93281C6Bd220',
        [Network.CHILIZ_MAINNET]: '0x60C2b0B6CB2EB83349eB770f76a1C6dF611E5f03',
    },
    setup: {
        nameKey: 'app.plugins.multisig.meta.setup.name',
        descriptionKey: 'app.plugins.multisig.meta.setup.description',
    },
};
