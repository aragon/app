/**
 * Where the data of an account came from. Values match the backend response.
 */
export enum WorkspaceCoverageSource {
    /**
     * The Aragon index.
     */
    INDEX = 'index',
    /**
     * The Safe transaction service.
     */
    SAFE = 'safe',
}
