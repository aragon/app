import { type Token } from '@/modules/finance/api/financeService/domain/asset';
import { type TransactionType } from '@/modules/finance/api/financeService/domain/enum/transactionType';
import { TransactionType as DataListTransactionType } from '@aragon/ods'

export const transactionTypeToDataListType: Record<TransactionType, DataListTransactionType> = {
  withdraw: DataListTransactionType.WITHDRAW,
  deposit: DataListTransactionType.DEPOSIT,
};

export interface ITransaction {
  // awaiting chainId from backend to include type, required
  network?: string;
  blockNumber?: number;
  blockTimestamp?: number;
  fromAddress?: string;
  toAddress?: string;
  token?: Token;
  value?: string;
  type: TransactionType;
  transactionHash: `0x${string}`;
}