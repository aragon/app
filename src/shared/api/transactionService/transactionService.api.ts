import type { Network } from '../daoService';
import type { IRequestUrlQueryParams } from '../httpService';
import type { TransactionType } from './domain';

export interface IGetTransactionStatusUrlParams {
    /**
     * Network of the transaction.
     */
    network: Network;
    /**
     * Hash of the transaction.
     */
    transactionHash: string;
}


export interface IGetTransactionStatusQueryParams {
    /**
     * Type of the transaction.
     */
    type: TransactionType;
}

export interface IGetTransactionStatusParams
    extends IRequestUrlQueryParams<IGetTransactionStatusUrlParams, IGetTransactionStatusQueryParams> {}
