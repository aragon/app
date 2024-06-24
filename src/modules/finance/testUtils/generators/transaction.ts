import { TransactionType } from '@/modules/finance/api/financeService/domain/enum';
import { type ITransaction } from '@/modules/finance/api/financeService/domain/transaction';

export const generateTransaction = (transaction?: Partial<ITransaction>): ITransaction => ({
      transactionHash: '0x0000000000000000000000000000000000000000',
      type: TransactionType.DEPOSIT,
    ...transaction,
});