import type { IBalance } from '../../api/financeService';
import { generateAsset } from './asset';

export const generateBalance = (balance?: Partial<IBalance>): IBalance => ({
    ...generateAsset(balance),
    balance: '0',
    ...balance,
});
