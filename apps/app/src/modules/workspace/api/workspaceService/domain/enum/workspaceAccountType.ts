/**
 * Type of an account belonging to a workspace. Only DAO accounts are supported for now, Safe accounts are the next
 * account type to be added (see `docs/projectDocs/createWorkspace.md`).
 */
export enum WorkspaceAccountType {
    DAO = 'DAO',
    SAFE = 'SAFE',
}
