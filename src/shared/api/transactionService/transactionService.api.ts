import type { Network } from "../daoService";
import type { IRequestUrlQueryParams } from "../httpService";

export interface IGetTransactionStatusUrlParams {
    network: Network;
    transactionHash: string;
}

export enum TransactionType {
    DAO_CREATE = 'daoCreate',
    PROPOSAL_CREATE = 'proposalCreate',
    PROPOSAL_ADVANCE_STAGE = 'proposalAdvanceStage',
    PROPOSAL_VOTE = 'proposalVote',
    PROPOSAL_EXECUTE = 'proposalExecute',
}
export interface IGetTransactionStatusQueryParams {
  type: TransactionType;
}

export interface IGetTransactionStatusParams extends IRequestUrlQueryParams<IGetTransactionStatusUrlParams, IGetTransactionStatusQueryParams> {}
