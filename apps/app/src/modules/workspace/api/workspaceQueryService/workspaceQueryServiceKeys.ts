import { apiVersionUtils } from '@/shared/utils/apiVersionUtils';
import type {
    IGetWorkspaceAccountsParams,
    IGetWorkspaceAssetListParams,
} from './workspaceQueryService.api';

export enum WorkspaceQueryServiceKey {
    ACCOUNTS = 'WORKSPACE_ACCOUNTS',
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
};
