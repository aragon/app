import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import type { IPluginInfo } from '@/shared/types';

export const lockToVotePlugin: IPluginInfo = {
    id: PluginInterfaceType.LOCK_TO_VOTE,
    subdomain: 'lock-2-vote',
    name: 'Lock To Vote',
    installVersion: {
        release: 1,
        build: 1,
        releaseNotes:
            'https://github.com/aragon/lock-to-vote-plugin/releases/tag/v1.1',
        description: 'This is the initial release of Lock To Vote.',
    },
    repositoryAddresses: {
        [Network.ETHEREUM_MAINNET]:
            '0x0f4FBD2951Db08B45dE16e7519699159aE1b4bb7',
        [Network.ETHEREUM_SEPOLIA]:
            '0x499f7c3E8778D07BbBdc434dF06a985e54d7ed35',
        [Network.POLYGON_MAINNET]: '0x326D2b4cC92281D6fF757D79af98bE255BA45cE1',
        [Network.BASE_MAINNET]: '0x05ECA5ab78493Bf812052B0211a206BCBA03471B',
        [Network.ARBITRUM_MAINNET]:
            '0xe92eF55cCbB3ac48f54f2FcDC4c49379CB01C57F',
        [Network.ZKSYNC_MAINNET]: '0xd0f0Bc285F4D27417ECd8C027BB6746690ba72b2',
        [Network.ZKSYNC_SEPOLIA]: '0x8e9E356D9a0a99a88b22C1913D3891985959b3A8',
        [Network.PEAQ_MAINNET]: '0x077F72D7676483D9778439AA8d58dbDf8DD80a82',
        [Network.OPTIMISM_MAINNET]:
            '0x306E4339aE3bd3ba7Fd1BB32c8b4d3A5cd90f379',
        [Network.CHILIZ_MAINNET]: '0x43F3F0A229c69340E49104EA5202ae9e25DEc06B',
        [Network.AVAX_MAINNET]: '0x8CB279002127C6c1fc3fE05c81B29587c65B9150',
        [Network.KATANA_MAINNET]: '0xba588C53B6a368A2F80a741D9301b6f27bFEB483',
    },
    setup: {
        nameKey: 'app.plugins.lockToVote.meta.setup.name',
        descriptionKey: 'app.plugins.lockToVote.meta.setup.description',
    },
};
