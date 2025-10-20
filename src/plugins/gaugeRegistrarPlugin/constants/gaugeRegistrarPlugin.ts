import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import type { IPluginInfo } from '@/shared/types';

export const gaugeRegistrarPlugin: IPluginInfo = {
    id: PluginInterfaceType.GAUGE_REGISTRAR,
    subdomain: 'gauuge-registrar',
    name: 'Gauge Registrar',
    installVersion: {
        release: 1,
        build: 1,
        releaseNotes: 'https://github.com/aragon/lock-to-vote-plugin/releases/tag/v1.1',
        description: 'This is the initial release of Lock To Vote.',
    },
    repositoryAddresses: {
        [Network.ETHEREUM_MAINNET]: '0x000',
        [Network.ETHEREUM_SEPOLIA]: '0x000',
        [Network.POLYGON_MAINNET]: '0x000',
        [Network.BASE_MAINNET]: '0x000',
        [Network.ARBITRUM_MAINNET]: '0x000',
        [Network.ZKSYNC_MAINNET]: '0x000',
        [Network.ZKSYNC_SEPOLIA]: '0x000',
        [Network.PEAQ_MAINNET]: '0x000',
        [Network.OPTIMISM_MAINNET]: '0x000',
        [Network.CORN_MAINNET]: '0x000',
        [Network.CHILIZ_MAINNET]: '0x000',
        [Network.AVAX_MAINNET]: '0x000',
    },
    setup: {
        nameKey: 'app.plugins.lockToVote.meta.setup.name',
        descriptionKey: 'app.plugins.lockToVote.meta.setup.description',
    },
};
