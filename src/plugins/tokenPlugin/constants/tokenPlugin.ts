import { Network } from '@/shared/api/daoService';
import type { IPluginInfo } from '@/shared/types';

export const tokenPlugin: IPluginInfo = {
    id: 'token-voting',
    name: 'Token',
    installVersion: {
        release: 1,
        build: 3,
        releaseNotes: 'https://github.com/aragon/token-voting-plugin/releases/tag/v1.3.0',
        description:
            'This optional upgrade introduces minor new features, including the ability to customize metadata for governance plugins.',
    },
    repositoryAddresses: {
        [Network.ARBITRUM_MAINNET]: '0x1AeD2BEb470aeFD65B43f905Bd5371b1E4749d18',
        [Network.BASE_MAINNET]: '0x2532570DcFb749A7F976136CC05648ef2a0f60b0',
        [Network.ETHEREUM_MAINNET]: '0xb7401cD221ceAFC54093168B814Cc3d42579287f',
        [Network.ETHEREUM_SEPOLIA]: '0x424F4cA6FA9c24C03f2396DF0E96057eD11CF7dF',
        [Network.POLYGON_MAINNET]: '0xae67aea0B830ed4504B36670B5Fa70c5C386Bb58',
        [Network.ZKSYNC_MAINNET]: '0xE8F4C59f83CeE31A867E61c9959533A6e95ebCB3',
        [Network.ZKSYNC_SEPOLIA]: '0x1f5f8f677164AA4D9b4465A99D22e1e01dC24160',
        [Network.PEAQ_MAINNET]: '0xFBFbE98845B4E2751a8A004B5A1759e3A278FC68',
        [Network.OPTIMISM_MAINNET]: '0x666bFa1c64c40faEE8582496B040AAE35E25c19d',
        [Network.CORN_MAINNET]: '0x67C579fC2676a496DCE7dAB9695D323219d339EB',
    },
    setup: {
        nameKey: 'app.plugins.token.setup.name',
        descriptionKey: 'app.plugins.token.setup.description',
    },
};
