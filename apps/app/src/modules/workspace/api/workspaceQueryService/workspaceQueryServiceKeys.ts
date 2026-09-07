import { apiVersionUtils } from '@/shared/utils/apiVersionUtils';
import type { IGetWorkspaceAccountsParams } from './workspaceQueryService.api';

export enum WorkspaceQueryServiceKey {
    ACCOUNTS = 'WORKSPACE_ACCOUNTS',
}

export const workspaceQueryServiceKeys = {
    accounts: (params: IGetWorkspaceAccountsParams) => [
        WorkspaceQueryServiceKey.ACCOUNTS,
        apiVersionUtils.getApiVersion(),
        params,
    ],
};
