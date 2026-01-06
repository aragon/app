import type { ProposalActionType } from '../../api/governanceService';

export interface IUseMetadataActionPinParams {
    /**
     * Index of the action in the actions array.
     */
    actionIndex: number;
    /**
     * Type of metadata action (DAO or plugin).
     */
    actionType:
        | ProposalActionType.METADATA_UPDATE
        | ProposalActionType.METADATA_PLUGIN_UPDATE;
    /**
     * Whether the hook is enabled.
     * @default true
     */
    enabled?: boolean;
}

export interface IUseMetadataActionPinReturn {
    /**
     * Whether the action is currently being pinned.
     */
    isPinning: boolean;
    /**
     * Error that occurred during pinning, if any.
     */
    pinError: Error | null;
    /**
     * Current pin status.
     */
    pinStatus: 'idle' | 'pending' | 'success' | 'error';
    /**
     * Manually trigger a pin operation.
     */
    triggerPin: () => Promise<void>;
    /**
     * Clear the current error state.
     */
    clearError: () => void;
}
