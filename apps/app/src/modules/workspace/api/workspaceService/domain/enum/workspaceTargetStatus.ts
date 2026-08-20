export enum WorkspaceTargetStatus {
    PENDING = 'pending',
    DONE = 'done',
    /**
     * No ABI could be obtained, so nothing is known about the access control of the target. It must
     * never be read as "the target has none".
     */
    UNDETERMINED = 'undetermined',
    NOT_A_CONTRACT = 'notAContract',
    FAILED = 'failed',
}
