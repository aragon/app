import type { Network } from '../daoService';
import type {
    IRequestUrlBodyParams,
    IRequestUrlParams,
    IRequestUrlQueryParams,
} from '../httpService';
import type { ISafeInfo, ISafeTransactionData } from './domain';

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
    currentNonce: ISafeInfo['nonce'];
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

export interface IGetSafeNextNonceParams
    extends IRequestUrlParams<ISafeUrlParams> {}

export interface IGetSafeBalancesParams
    extends IRequestUrlParams<ISafeUrlParams> {}

export interface IProposeSafeTransactionBody {
    safeTransactionData: ISafeTransactionData;
    safeTxHash: string;
    senderAddress: string;
    senderSignature: string;
    origin: string;
}

export interface IProposeSafeTransactionParams
    extends IRequestUrlBodyParams<
        ISafeUrlParams,
        IProposeSafeTransactionBody
    > {}

export interface IConfirmSafeTransactionUrlParams {
    network: Network;
    safeTxHash: string;
}

export interface IConfirmSafeTransactionBody {
    signature: string;
}

export interface IConfirmSafeTransactionParams
    extends IRequestUrlBodyParams<
        IConfirmSafeTransactionUrlParams,
        IConfirmSafeTransactionBody
    > {}
