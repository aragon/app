import { TransactionType as DataListTransactionType } from '@aragon/ods'

export enum TransactionStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

export const transactionTypeToDataListType: Record<TransactionType, DataListTransactionType> = {
  withdraw: DataListTransactionType.WITHDRAW,
  deposit: DataListTransactionType.DEPOSIT,
};

interface Token {
  address?: string;
  symbol?: string;
  name?: string;
  type?: string;
  logo?: string | null;
}

export interface ITransaction {
  // awaiting chainId from backend to include type, required
  network?: string;
  blockNumber?: number;
  blockTimestamp?: number;
  fromAddress?: string;
  toAddress?: string;
  token?: Token;
  value?: string;
  type: keyof typeof transactionTypeToDataListType;
  transactionHash: `0x${string}`;
}