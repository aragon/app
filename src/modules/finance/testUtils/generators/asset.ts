import type { IAsset } from '../../api/financeService';

export const generateAsset = (asset?: Partial<IAsset>): IAsset => ({
    network: 'ethereum-mainnet',
    token: {
        name: "Ethereum", symbol: 'ETH', logo: 'https://test.com',
        address: '',
        decimals: 0,
        priceChangeOnDayUsd: '',
        priceUsd: '',
        type: ''
    },
    amount: '0',
    amountUsd: '0',
    tokenAddress: '0xec10f0f223e52f2d939c7372b62ef2f55173282f',
    daoAddress: '0xec10f0f223e52f2d939c7372b62ef2f55073282f',
    ...asset,
});
