import type { Network } from '../daoService';
import type { IRequestUrlBodyParams, IRequestUrlParams } from '../httpService';
import type {
    ISafeInfo,
    ISafeMeta,
    ISafeMultisigTransaction,
    ISafeNextNonce,
    ISafePaginatedResponse,
    ISafeTransactionData,
} from './domain';

export interface ISafeUrlParams {
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Address of the Safe. Normalised to its checksummed form at the service boundary.
     */
    address: string;
}

export interface IGetSafeInfoParams extends IRequestUrlParams<ISafeUrlParams> {}

export interface IGetSafePendingTransactionsQueryParams {
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
    extends IRequestUrlParams<ISafeUrlParams> {
    queryParams?: IGetSafePendingTransactionsQueryParams;
}

export interface IGetSafeNextNonceParams
    extends IRequestUrlParams<ISafeUrlParams> {}

export interface IGetSafeTransactionHistoryQueryParams {
    /**
     * Maximum number of transactions to return.
     */
    limit?: number;
    /**
     * Number of transactions to skip.
     */
    offset?: number;
}

export interface IGetSafeTransactionHistoryParams
    extends IRequestUrlParams<ISafeUrlParams> {
    queryParams?: IGetSafeTransactionHistoryQueryParams;
}

export interface IGetSafeBalancesParams
    extends IRequestUrlParams<ISafeUrlParams> {}

export interface ISafeInfoResponse extends ISafeInfo {
    meta: ISafeMeta;
}

export interface ISafeNextNonceResponse extends ISafeNextNonce {
    meta: ISafeMeta;
}

export interface ISafeQueueResponse
    extends ISafePaginatedResponse<ISafeMultisigTransaction> {
    meta: ISafeMeta;
}

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

export interface IDeleteSafeTransactionUrlParams {
    network: Network;
    safeTxHash: string;
}

/**
 * EIP-712 `DeleteRequest` signature authorising the removal. The service accepts it only from the
 * address it recorded as the transaction's proposer.
 */
export interface IDeleteSafeTransactionBody {
    signature: string;
}

export interface IDeleteSafeTransactionParams
    extends IRequestUrlBodyParams<
        IDeleteSafeTransactionUrlParams,
        IDeleteSafeTransactionBody
    > {}
