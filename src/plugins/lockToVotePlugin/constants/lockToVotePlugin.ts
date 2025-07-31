import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import type { IPluginInfo } from '@/shared/types';

export const lockToVotePlugin: IPluginInfo = {
    id: PluginInterfaceType.LOCK_TO_VOTE,
    subdomain: 'lock-to-vote',
    name: 'Lock To Vote',
    installVersion: { release: 1, build: 1, releaseNotes: '', description: '' },
    repositoryAddresses: {
        [Network.ETHEREUM_MAINNET]: '0x0000000000000000000000000000000000000000',
        [Network.ETHEREUM_SEPOLIA]: '0x530eF57193D7d6C04f95FAC63fa7d70527Ebf3F0',
        [Network.POLYGON_MAINNET]: '0x0000000000000000000000000000000000000000',
        [Network.BASE_MAINNET]: '0x0000000000000000000000000000000000000000',
        [Network.ARBITRUM_MAINNET]: '0x0000000000000000000000000000000000000000',
        [Network.ZKSYNC_MAINNET]: '0x0000000000000000000000000000000000000000',
        [Network.ZKSYNC_SEPOLIA]: '0x0000000000000000000000000000000000000000',
        [Network.PEAQ_MAINNET]: '0x0000000000000000000000000000000000000000',
        [Network.OPTIMISM_MAINNET]: '0x0000000000000000000000000000000000000000',
        [Network.CORN_MAINNET]: '0x0000000000000000000000000000000000000000',
        [Network.CHILIZ_MAINNET]: '0x0000000000000000000000000000000000000000',
    },
    setup: {
        nameKey: 'app.plugins.lockToVote.meta.setup.name',
        descriptionKey: 'app.plugins.lockToVote.meta.setup.description',
    },
};
