import type { Network } from '../daoService';
import type { IRequestUrlParams, IRequestUrlQueryParams } from '../httpService';

export interface ISafeUrlParams {
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Address of the Safe.
     */
    address: string;
}

export interface IGetSafeInfoParams extends IRequestUrlParams<ISafeUrlParams> {}

export interface IGetSafePendingTransactionsQueryParams {
    /**
     * Current nonce of the Safe (`ISafeInfo.nonce`). Transactions below it can never execute, so
     * the filter is what separates a live queue from permanently dead transactions.
     */
    currentNonce: number;
    /**
     * Maximum number of transactions to return.
     */
    limit?: number;
    /**
     * Number of transactions to skip.
     */
    offset?: number;
}

export interface IGetSafePendingTransactionsParams
    extends IRequestUrlQueryParams<
        ISafeUrlParams,
        IGetSafePendingTransactionsQueryParams
    > {}

export interface IGetSafeBalancesParams
    extends IRequestUrlParams<ISafeUrlParams> {}
