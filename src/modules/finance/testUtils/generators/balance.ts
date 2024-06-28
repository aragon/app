import type { IAsset } from '../../api/financeService';
import { generateAsset } from './asset';

export const generateBalance = (balance?: Partial<IAsset>, asset?: Partial<IAsset>): IAsset => ({
    ...generateAsset(balance),
    amount: '0',
    amountUsd: '0.00',
    daoAddress: `0xTestDaoAddress`,
    network: 'ethereum-mainnet',
    token: { ...generateAsset(asset) },
    tokenAddress: '0xTestTokenAddress',
    ...balance,
});
