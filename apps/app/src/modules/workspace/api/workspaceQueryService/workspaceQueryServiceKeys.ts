import { apiVersionUtils } from '@/shared/utils/apiVersionUtils';
import type {
    IGetWorkspaceAccountsParams,
    IGetWorkspaceAssetListParams,
    IGetWorkspaceTransactionsParams,
} from './workspaceQueryService.api';

export enum WorkspaceQueryServiceKey {
    ACCOUNTS = 'WORKSPACE_ACCOUNTS',
    TRANSACTIONS = 'WORKSPACE_TRANSACTIONS',
    ASSET_LIST = 'WORKSPACE_ASSET_LIST',
}

export const workspaceQueryServiceKeys = {
    accounts: (params: IGetWorkspaceAccountsParams) => [
        WorkspaceQueryServiceKey.ACCOUNTS,
        apiVersionUtils.getApiVersion(),
        params,
    ],
    assetList: (params: IGetWorkspaceAssetListParams) => [
        WorkspaceQueryServiceKey.ASSET_LIST,
        apiVersionUtils.getApiVersion(),
        params,
    ],
    transactions: (params: IGetWorkspaceTransactionsParams) => [
        WorkspaceQueryServiceKey.TRANSACTIONS,
        apiVersionUtils.getApiVersion(),
        params,
    ],
};
