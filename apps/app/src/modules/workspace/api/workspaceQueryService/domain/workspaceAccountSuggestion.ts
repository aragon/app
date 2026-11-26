import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IDao } from '@/shared/api/daoService';
import type { IWorkspaceAccount } from '../../workspaceService';
import type { WorkspaceAccountSuggestionRole } from './enum';

export interface IWorkspaceAccountSuggestion {
    /**
     * The suggested account.
     */
    account: IWorkspaceAccount;
    /**
     * DAO of the account, for its name and avatar. Undefined for Safes.
     */
    dao?: IDao;
    /**
     * Why the account is suggested to the wallet.
     */
    role: WorkspaceAccountSuggestionRole;
}

export interface IWorkspaceAccountSuggestionListResponse
    extends IPaginatedResponse<IWorkspaceAccountSuggestion> {
    /**
     * Whether a source could not be read, so accounts may be missing.
     */
    isIncomplete: boolean;
}
