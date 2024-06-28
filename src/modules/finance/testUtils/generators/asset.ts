import type { IAsset } from '../../api/financeService';
import { generateToken } from './token';

export const generateAsset = (asset?: Partial<IAsset>): IAsset => ({
    amount: '0',
    amountUsd: '0.00',
    daoAddress: `0xTestDaoAddress`,
    network: 'ethereum-mainnet',
    token: { ...generateToken(asset) },
    tokenAddress: '0xTestTokenAddress',
    ...asset,
});
