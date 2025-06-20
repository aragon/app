import { Network } from '@/shared/api/daoService';
import type { IPluginInfo } from '@/shared/types';
import { IconType } from '@aragon/gov-ui-kit';

export enum CapitalDistributorPluginPages {
    REWARDS = 'rewards',
}

export const capitalDistributorPlugin: IPluginInfo = {
    id: 'capital-distributor',
    name: 'Capital Distributor',
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
        [Network.CORN_MAINNET]: '0x0000000000000000000000000000000000000000',
    },
    pages: (baseUrl, context) => [
        {
            label: 'app.plugins.capitalDistributor.meta.link.rewards',
            link: `${baseUrl}/${CapitalDistributorPluginPages.REWARDS}`,
            icon: IconType.APP_ASSETS,
            lgHidden: context === 'dialog',
        },
    ],
};
