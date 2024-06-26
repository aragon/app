import { type ITransaction } from '@/modules/finance/api/financeService/';
import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IBalance } from './domain';
import type { IGetBalanceListParams, IGetTransactionListParams } from './financeService.api';
import { balanceListMock } from './financeServiceMocks';

class FinanceService extends AragonBackendService {
    private mock = true;

    private urls = {
        balanceList: '/balances',
        transactionList: '/transactions',
    };

    getBalanceList = async ({ queryParams }: IGetBalanceListParams): Promise<IPaginatedResponse<IBalance>> => {
        if (this.mock) {
            return balanceListMock;
        }

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
