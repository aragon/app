import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IBalance } from './domain';
import type { IGetBalanceListParams } from './financeService.api';
import { balanceListMock } from './financeServiceMocks';

class FinanceService extends AragonBackendService {
    private mock = true;

    private urls = {
        balanceList: '/balances',
    };

    getBalanceList = async ({ queryParams }: IGetBalanceListParams): Promise<IPaginatedResponse<IBalance>> => {
        if (this.mock) {
            return balanceListMock;
        }

        const result = await this.request<IPaginatedResponse<IBalance>>(this.urls.balanceList, { queryParams });

        return result;
    };
}

export const financeService = new FinanceService();
