import { AragonBackendService } from '../aragonBackendService';
import type { ITransactionStatus } from './domain';
import type { IGetTransactionStatusParams } from './transactionService.api';

class TransactionService extends AragonBackendService {
    private readonly urls = {
        status: '/v2/transactions/:network/:transactionHash/status',
    };

    getTransactionStatus = async (params: IGetTransactionStatusParams): Promise<ITransactionStatus> => {
        const result = await this.request<ITransactionStatus>(this.urls.status, params);

        return result;
    };
}

export const transactionService = new TransactionService();
