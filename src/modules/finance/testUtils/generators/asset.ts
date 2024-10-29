import type { IAsset } from '../../api/financeService';
import { generateToken } from './token';

export const generateAsset = (asset?: Partial<IAsset>): IAsset => ({
    amount: '0',
    token: generateToken(),
    ...asset,
});
