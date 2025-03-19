import type { Network } from "../daoService";
import type { IRequestUrlQueryParams } from "../httpService";

export interface IGetTransactionStatusUrlParams {
  network: Network;
  transactionsHash: string;
}

type TransactionType = "daoCreate" | "proposalCreate" | "proposalAdvanceStage" | "proposalVote" | "proposalExecute";

export interface IGetTransactionStatusQueryParams {
  type: TransactionType;
}

export interface IGetTransactionStatusParams extends IRequestUrlQueryParams<IGetTransactionStatusUrlParams, IGetTransactionStatusQueryParams> {}
