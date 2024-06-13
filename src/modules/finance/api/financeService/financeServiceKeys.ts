import type { IGetBalanceListParams } from './financeService.api';

export enum FinanceServiceKey {
    BALANCE_LIST = 'BALANCE_LIST',
}

export const financeServiceKeys = {
    balanceList: (params: IGetBalanceListParams) => [FinanceServiceKey.BALANCE_LIST, params],
};
