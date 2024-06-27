import type { IBalance } from '../../api/financeService';
import { generateAsset } from './asset';

export const generateBalance = (balance?: Partial<IBalance>): IBalance => ({
    ...generateAsset(balance),
    amount: '0',
    amountUsd: '0.00', 
    daoAddress: `0xTestDaoAddress`, 
    network: 'ethereum-mainnet',
    token: { ...generateAsset(balance)},
    tokenAddress: '0xTestTokenAddress',
    ...balance,
});
