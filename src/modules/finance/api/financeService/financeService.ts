import { type ITransaction } from '@/modules/finance/api/financeService/';
import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IAsset, IBalance } from './domain';
import type { IGetAssetListParams, IGetTransactionListParams } from './financeService.api';


class FinanceService extends AragonBackendService {
    private urls = {
        balanceList: '/assets',
        transactionList: '/transactions'
    };

    getAssetList = async ({ queryParams }: IGetAssetListParams): Promise<IPaginatedResponse<IBalance>> => {
        const result = await this.request<IPaginatedResponse<IBalance>>(this.urls.balanceList, { queryParams });

        return result;
    };

    getTransactionList = async ({
        queryParams,
    }: IGetTransactionListParams): Promise<IPaginatedResponse<ITransaction>> => {
        const result = await this.request<IPaginatedResponse<ITransaction>>(this.urls.transactionList, { queryParams });

        return result;
    };
}

export const financeService = new FinanceService();
