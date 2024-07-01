import type { IAsset } from '../../api/financeService';
import { generateToken } from './token';

export const generateAsset = (asset?: Partial<IAsset>): IAsset => ({
    amount: '0',
    amountUsd: '0.00',
    token: generateToken(),
    ...asset,
});
