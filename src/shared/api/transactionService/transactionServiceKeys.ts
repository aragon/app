import type { IGetTransactionStatusParams } from './transactionService.api';

export enum TransactionServiceKey {
    STATUS = 'STATUS',
}

export const transactionServiceKeys = {
    status: (params: IGetTransactionStatusParams) => [TransactionServiceKey.STATUS, params],
};
