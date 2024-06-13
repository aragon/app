import type { IAsset } from '../../api/financeService';

export const generateAsset = (asset?: Partial<IAsset>): IAsset => ({
    address: '0xec10f0f223e52f2d939c7372b62ef2f55173282f',
    network: 'ethereum-mainnet',
    symbol: 'ETH',
    logo: 'https://test.com',
    name: 'Ethereum',
    ...asset,
});
