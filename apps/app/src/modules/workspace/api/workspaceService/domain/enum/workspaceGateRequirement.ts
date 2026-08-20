/**
 * What a gated function demands of its caller. Gates returned by the backend only ever carry
 * `owner`, `role` or `authority`: `none` (the call got through unprivileged) and `unknown` (the
 * revert was not a recognised authorisation error) are not attributable to anybody and are left out
 * of the workspace.
 */
export enum WorkspaceGateRequirement {
    NONE = 'none',
    OWNER = 'owner',
    ROLE = 'role',
    AUTHORITY = 'authority',
    UNKNOWN = 'unknown',
}
