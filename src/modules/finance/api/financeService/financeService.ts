import type {
    ITransaction,
    ITransactionActionsResult,
} from '@/modules/finance/api/financeService/';
import {
    AragonBackendService,
    type IPaginatedResponse,
} from '@/shared/api/aragonBackendService';
import type { IAsset } from './domain';
import type {
    IGetAssetListParams,
    IGetTransactionActionsParams,
    IGetTransactionListParams,
} from './financeService.api';

class FinanceService extends AragonBackendService {
    private urls = {
        assets: '/v2/assets',
        transactions: '/v2/transactions',
        transactionActions: '/v2/transactions/:network/:id/actions',
    };

    getAssetList = async (
        params: IGetAssetListParams,
    ): Promise<IPaginatedResponse<IAsset>> => {
        const result = await this.request<IPaginatedResponse<IAsset>>(
            this.urls.assets,
            params,
        );

        return result;
    };

    getTransactionList = async (
        params: IGetTransactionListParams,
    ): Promise<IPaginatedResponse<ITransaction>> => {
        const result = await this.request<IPaginatedResponse<ITransaction>>(
            this.urls.transactions,
            params,
        );

        return result;
    };

    getTransactionActions = async <
        TResult extends ITransactionActionsResult = ITransactionActionsResult,
    >(
        params: IGetTransactionActionsParams,
    ): Promise<TResult> => {
        const result = await this.request<TResult>(
            this.urls.transactionActions,
            params,
        );

        return result;
    };
}

export const financeService = new FinanceService();
