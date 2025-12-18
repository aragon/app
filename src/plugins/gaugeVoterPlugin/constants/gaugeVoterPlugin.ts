import { IconType } from '@aragon/gov-ui-kit';
import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import type { IPluginInfo } from '@/shared/types';

export enum GaugeVoterPluginPages {
    GAUGES = 'gauges',
}

export const gaugeVoterPlugin: IPluginInfo = {
    id: PluginInterfaceType.GAUGE_VOTER,
    subdomain: 'gauge',
    name: 'Gauge',
    installVersion: { release: 1, build: 1, releaseNotes: '', description: '' },
    repositoryAddresses: {
        [Network.ARBITRUM_MAINNET]: '0x0000000000000000000000000000000000000000',
        [Network.BASE_MAINNET]: '0x0000000000000000000000000000000000000000',
        [Network.ETHEREUM_MAINNET]: '0x0000000000000000000000000000000000000000',
        [Network.ETHEREUM_SEPOLIA]: '0x0000000000000000000000000000000000000000',
        [Network.POLYGON_MAINNET]: '0x0000000000000000000000000000000000000000',
        [Network.ZKSYNC_MAINNET]: '0x0000000000000000000000000000000000000000',
        [Network.ZKSYNC_SEPOLIA]: '0x0000000000000000000000000000000000000000',
        [Network.PEAQ_MAINNET]: '0x0000000000000000000000000000000000000000',
        [Network.OPTIMISM_MAINNET]: '0x0000000000000000000000000000000000000000',
        [Network.CHILIZ_MAINNET]: '0x0000000000000000000000000000000000000000',
        [Network.AVAX_MAINNET]: '0x0000000000000000000000000000000000000000',
        [Network.KATANA_MAINNET]: '0x0000000000000000000000000000000000000000',
    },
    pageLinksLeft: (baseUrl, context) => [
        {
            label: 'app.plugins.gaugeVoter.meta.link.gauges',
            link: `${baseUrl}/${GaugeVoterPluginPages.GAUGES}`,
            icon: IconType.APP_PROPOSALS,
            lgHidden: context === 'dialog',
        },
    ],
};
