import { AragonBackendService } from "../aragonBackendService";
import type { ITransactionStatus } from "./domain";
import type { IGetTransactionStatusParams } from "./transactionService.api";

class TransactionService extends AragonBackendService {
  private urls ={
    status: '/transactions/:network/:transactionsHash/status',
  }

  getTransactionStatus = async (params: IGetTransactionStatusParams): Promise<ITransactionStatus> => {
    const result = await this.request<ITransactionStatus>(this.urls.status, params);

    return result;
  }
}

export const transactionService = new TransactionService();
