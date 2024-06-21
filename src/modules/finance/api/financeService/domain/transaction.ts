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
  address: string;
  symbol: string;
  name: string;
  type: string;
  logo: string | null;
}

export interface ITransaction {
  // awaiting chainId from backend to include type, required
  blockNumber?: number;
  blockTimestamp?: number;
  category?: string;
  daoAddress?: string;
  fromAddress?: string;
  network?: string;
  toAddress?: string;
  token?: Token;
  tokenAddress?: string;
  transactionHash: `0x${string}`;
  type: keyof typeof transactionTypeToDataListType;
  value?: string;
}