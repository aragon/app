import { WorkspaceAccountType } from '../api/workspaceService';

/**
 * Account types that are governed through Aragon. Any other type — a Safe, an EOA or an unknown
 * contract — is treated as an external account, which is the main risk signal of a workspace.
 */
export const workspaceGovernedAccountTypes: WorkspaceAccountType[] = [
    WorkspaceAccountType.DAO,
    WorkspaceAccountType.PLUGIN,
];
