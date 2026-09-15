/**
 * Whether the source backing an address could be read. Values match the backend response.
 */
export enum WorkspaceAccountInfoStatus {
    /**
     * The address resolved to an indexed DAO or a readable Safe.
     */
    AVAILABLE = 'available',
    /**
     * The address is neither an indexed DAO nor a Safe on a network the Safe service covers. Permanent for as long
     * as the address stays what it is.
     */
    UNSUPPORTED = 'unsupported',
    /**
     * The source exists but could not be read right now (rate limit, timeout, gateway down). Transient.
     */
    UNAVAILABLE = 'unavailable',
}
