import { type TransactionType, type ITransaction } from '@/modules/finance/api/financeService/domain/transaction';

export const generateTransaction = (transaction?: Partial<ITransaction>): ITransaction => ({
      transactionHash: '0x0000000000000000000000000000000000000000',
      type: 'deposit' as TransactionType,
    ...transaction,
});