import { apiVersionUtils } from '@/shared/utils/apiVersionUtils';
import type {
    IGetWorkspaceAccountsParams,
    IGetWorkspaceTransactionsParams,
} from './workspaceQueryService.api';

export enum WorkspaceQueryServiceKey {
    ACCOUNTS = 'WORKSPACE_ACCOUNTS',
    TRANSACTIONS = 'WORKSPACE_TRANSACTIONS',
}

export const workspaceQueryServiceKeys = {
    accounts: (params: IGetWorkspaceAccountsParams) => [
        WorkspaceQueryServiceKey.ACCOUNTS,
        apiVersionUtils.getApiVersion(),
        params,
    ],
    transactions: (params: IGetWorkspaceTransactionsParams) => [
        WorkspaceQueryServiceKey.TRANSACTIONS,
        apiVersionUtils.getApiVersion(),
        params,
    ],
};
