import type {
    IGetAssetListParams,
    IGetTokenInfoParams,
    IGetTransactionActionsParams,
    IGetTransactionListParams,
} from './financeService.api';

export enum FinanceServiceKey {
    ASSET_LIST = 'ASSET_LIST',
    TOKEN_INFO = 'TOKEN_INFO',
    TRANSACTION_ACTIONS = 'TRANSACTION_ACTIONS',
    TRANSACTION_LIST = 'TRANSACTION_LIST',
}

export const financeServiceKeys = {
    assetList: (params: IGetAssetListParams) => [
        FinanceServiceKey.ASSET_LIST,
        params,
    ],
    tokenInfo: (params: IGetTokenInfoParams) => [
        FinanceServiceKey.TOKEN_INFO,
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
