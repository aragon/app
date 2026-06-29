import type {
    IGetAssetListParams,
    IGetTransactionActionsParams,
    IGetTransactionListParams,
} from './financeService.api';

export enum FinanceServiceKey {
    ASSET_LIST = 'ASSET_LIST',
    TRANSACTION_ACTIONS = 'TRANSACTION_ACTIONS',
    TRANSACTION_LIST = 'TRANSACTION_LIST',
}

export const financeServiceKeys = {
    assetList: (params: IGetAssetListParams) => [
        FinanceServiceKey.ASSET_LIST,
        params,
    ],
    transactionList: (params: IGetTransactionListParams) => [
        FinanceServiceKey.TRANSACTION_LIST,
        params,
    ],
    transactionActions: (params: IGetTransactionActionsParams) => [
        FinanceServiceKey.TRANSACTION_ACTIONS,
        params,
    ],
};
