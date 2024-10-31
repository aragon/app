import { type ITransaction } from '@/modules/finance/api/financeService/';
import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IAsset } from './domain';
import type { IGetAssetListParams, IGetTransactionListParams } from './financeService.api';

class FinanceService extends AragonBackendService {
    private urls = {
        assets: '/assets',
        transactions: '/transactions',
    };

    getAssetList = async (params: IGetAssetListParams): Promise<IPaginatedResponse<IAsset>> => {
        const result = await this.request<IPaginatedResponse<IAsset>>(this.urls.assets, params);

        return result;
    };

    getTransactionList = async (params: IGetTransactionListParams): Promise<IPaginatedResponse<ITransaction>> => {
        const result = await this.request<IPaginatedResponse<ITransaction>>(this.urls.transactions, params);

        return result;
    };
}

export const financeService = new FinanceService();
