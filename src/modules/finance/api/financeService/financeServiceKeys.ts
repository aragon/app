import type { IGetBalanceListParams, IGetTransactionListParams } from './financeService.api';

export enum FinanceServiceKey {
    BALANCE_LIST = 'BALANCE_LIST',
    TRANSACTION_LIST = 'TRANSACTION_LIST'
}

export const financeServiceKeys = {
    balanceList: (params: IGetBalanceListParams) => [FinanceServiceKey.BALANCE_LIST, params],
    transactionList: (params: IGetTransactionListParams) => [FinanceServiceKey.TRANSACTION_LIST, params]
};
