/**
 * Status of a row returned by the workspace transactions endpoint. Values match the backend response.
 */
export enum WorkspaceTransactionStatus {
    /**
     * Safe transaction queued on the Safe transaction service but not executed onchain yet.
     */
    PENDING = 'pending',
}
