import { apiVersionUtils } from '@/shared/utils/apiVersionUtils';
import type {
    IGetWorkspaceAccountSuggestionsParams,
    IGetWorkspaceAccountsParams,
    IGetWorkspaceAssetListParams,
    IGetWorkspaceMemberListParams,
    IGetWorkspaceProposalListParams,
    IGetWorkspaceTodoParams,
    IGetWorkspaceTransactionsParams,
} from './workspaceQueryService.api';

export enum WorkspaceQueryServiceKey {
    ACCOUNTS = 'WORKSPACE_ACCOUNTS',
    ACCOUNT_SUGGESTIONS = 'WORKSPACE_ACCOUNT_SUGGESTIONS',
    TRANSACTIONS = 'WORKSPACE_TRANSACTIONS',
    ASSET_LIST = 'WORKSPACE_ASSET_LIST',
    PROPOSAL_LIST = 'WORKSPACE_PROPOSAL_LIST',
    MEMBER_LIST = 'WORKSPACE_MEMBER_LIST',
    TODO = 'WORKSPACE_TODO',
}

export const workspaceQueryServiceKeys = {
    accountSuggestions: (params: IGetWorkspaceAccountSuggestionsParams) => [
        WorkspaceQueryServiceKey.ACCOUNT_SUGGESTIONS,
        params,
    ],
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
    proposalList: (params: IGetWorkspaceProposalListParams) => [
        WorkspaceQueryServiceKey.PROPOSAL_LIST,
        apiVersionUtils.getApiVersion(),
        params,
    ],
    memberList: (params: IGetWorkspaceMemberListParams) => [
        WorkspaceQueryServiceKey.MEMBER_LIST,
        apiVersionUtils.getApiVersion(),
        params,
    ],
    todo: (params: IGetWorkspaceTodoParams) => [
        WorkspaceQueryServiceKey.TODO,
        apiVersionUtils.getApiVersion(),
        params,
    ],
};
