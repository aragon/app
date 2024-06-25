import type { IGetAssetListParams, IGetTransactionListParams } from './financeService.api';

export enum FinanceServiceKey {
    BALANCE_LIST = 'BALANCE_LIST',
    TRANSACTION_LIST = 'TRANSACTION_LIST'
}

export const financeServiceKeys = {
    balanceList: (params: IGetAssetListParams) => [FinanceServiceKey.BALANCE_LIST, params],
    transactionList: (params: IGetTransactionListParams) => [FinanceServiceKey.TRANSACTION_LIST, params]
};
