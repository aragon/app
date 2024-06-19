import { type ITransaction } from '@/modules/finance/api/financeService/domain/transaction';

export const generateTransaction = (transaction?: Partial<ITransaction>): ITransaction => ({
      chainId: 1,
      date: 'Unknown',
      hash: '0x0000000000000000000000000000000000000000',
    ...transaction,
});