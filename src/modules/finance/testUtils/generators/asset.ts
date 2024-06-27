import type { IAsset } from '../../api/financeService';

export const generateAsset = (asset?: Partial<IAsset & { address?: string }>): IAsset => ({
    address: '0xTestAddress',
    network: 'ethereum-mainnet',
    symbol: 'ETH',
    logo: 'https://test.com',
    name: 'Ethereum',
    type: 'ERC-20',
    decimals: 0,
    priceChangeOnDayUsd: '0.00',
    priceUsd: '0.00',
    ...asset,
});
