import type {
    IGetWorkspaceAssetListParams,
    IGetWorkspaceTransactionAvailabilityParams,
    IGetWorkspaceTransactionListParams,
} from './workspaceFinanceService.api';

export enum WorkspaceFinanceServiceKey {
    WORKSPACE_ASSET_LIST = 'WORKSPACE_ASSET_LIST',
    WORKSPACE_TRANSACTION_LIST = 'WORKSPACE_TRANSACTION_LIST',
    WORKSPACE_TRANSACTION_AVAILABILITY = 'WORKSPACE_TRANSACTION_AVAILABILITY',
}

export const workspaceFinanceServiceKeys = {
    assetList: (params: IGetWorkspaceAssetListParams) => [
        WorkspaceFinanceServiceKey.WORKSPACE_ASSET_LIST,
        params,
    ],
    // The `pages` cursor is deliberately excluded: it is the position within the query, not part of its identity.
    transactionList: (params: IGetWorkspaceTransactionListParams) => [
        WorkspaceFinanceServiceKey.WORKSPACE_TRANSACTION_LIST,
        { queryParams: params.queryParams },
    ],
    transactionAvailability: (
        params: IGetWorkspaceTransactionAvailabilityParams,
    ) => [
        WorkspaceFinanceServiceKey.WORKSPACE_TRANSACTION_AVAILABILITY,
        params,
    ],
};
