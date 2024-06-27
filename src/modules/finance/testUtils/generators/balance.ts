import type { IAsset, IBalance } from '../../api/financeService';
import { generateAsset } from './asset';

export const generateBalance = (balance?: Partial<IBalance>, asset?: Partial<IAsset>): IBalance => ({
    ...generateAsset(balance),
    amount: '0',
    amountUsd: '0.00',
    daoAddress: `0xTestDaoAddress`,
    network: 'ethereum-mainnet',
    token: { ...generateAsset(asset) },
    tokenAddress: '0xTestTokenAddress',
    ...balance,
});
