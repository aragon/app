/**
 * Type of an address as resolved by the workspace accounts API. Values match the backend response.
 */
export enum WorkspaceAccountInfoType {
    DAO = 'dao',
    SAFE = 'safe',
    /**
     * The address is neither an indexed DAO nor a readable Safe, either because it is not one or because the Safe
     * service could not be read.
     */
    UNKNOWN = 'unknown',
}
