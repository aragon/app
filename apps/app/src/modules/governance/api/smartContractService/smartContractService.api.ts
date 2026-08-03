import type { Network } from '@/shared/api/daoService';
import type {
    IRequestBodyParams,
    IRequestUrlBodyParams,
    IRequestUrlParams,
} from '@/shared/api/httpService';

export interface IGetAbiUrlParams {
    /**
     * Network of the smart contract.
     */
    network: Network;
    /**
     * Address of the the smart contract.
     */
    address: string;
}

export interface IGetAbiParams extends IRequestUrlParams<IGetAbiUrlParams> {}

export interface IDecodeTransactionUrlParams {
    /**
     * Network of the smart contract.
     */
    network: Network;
    /**
     * Address of the smart contract.
     */
    address: string;
}

export interface IDecodeTransactionBodyParams {
    /**
     * Encoded transaction data to be decoded.
     */
    data: string;
    /**
     * Value of the transaction.
     */
    value: string;
    /**
     * Address sending the transaction.
     */
    from: string;
}

export interface IDecodeTransactionParams
    extends IRequestUrlBodyParams<
        IDecodeTransactionUrlParams,
        IDecodeTransactionBodyParams
    > {}

export interface IDecodeTransactionsLightUrlParams {
    /**
     * Network of the smart contracts to decode actions for.
     */
    network: Network;
}

export interface IDecodeTransactionsLightQueryParams {
    /**
     * Address sending the actions, i.e., DAO.
     */
    from: string;
}

export interface IDecodeTransactionsLightAction {
    /**
     * Target address of the action.
     */
    to: string;
    /**
     * Value of the action.
     */
    value: number | string;
    /**
     * Encoded data of the action.
     */
    data: string;
}

/**
 * Array of actions to be decoded.
 */
export type IDecodeTransactionsLightBodyParams =
    IDecodeTransactionsLightAction[];

export interface IDecodeTransactionsLightParams
    extends IRequestUrlParams<IDecodeTransactionsLightUrlParams>,
        IRequestBodyParams<IDecodeTransactionsLightBodyParams> {
    /**
     * Query parameters of the request, omitted when decoding outside DAO context.
     */
    queryParams?: IDecodeTransactionsLightQueryParams;
}
