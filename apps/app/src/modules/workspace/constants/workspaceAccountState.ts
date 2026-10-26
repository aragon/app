/**
 * What a single-account lookup of the workspace accounts API says an address is, as read by
 * `workspaceUtils.resolveAccountState`.
 */
export enum WorkspaceAccountState {
    /**
     * An indexed DAO.
     */
    DAO = 'DAO',
    /**
     * A readable Safe.
     */
    SAFE = 'SAFE',
    /**
     * Neither an indexed DAO nor a Safe on the network. Permanent for as long as the address stays what it is.
     */
    NOT_FOUND = 'NOT_FOUND',
    /**
     * The source behind the address could not be read right now (rate limit, timeout). Transient.
     */
    UNAVAILABLE = 'UNAVAILABLE',
}
