import type { Hex } from 'viem';
import type { ProposalActionType } from '../../api/governanceService';
import type { IMetadataAction } from '../../utils/metadataActionPinUtils';

export interface IMetadataActionWithIndex {
    /**
     * The metadata action to pin.
     */
    action: IMetadataAction;
    /**
     * Index of the action in the form actions array.
     */
    actionIndex: number;
    /**
     * Type of the metadata action.
     */
    actionType:
        | ProposalActionType.METADATA_UPDATE
        | ProposalActionType.METADATA_PLUGIN_UPDATE;
}

export interface IPinResult {
    /**
     * Index of the action that was pinned.
     */
    actionIndex: number;
    /**
     * Whether the pinning operation succeeded.
     */
    success: boolean;
    /**
     * IPFS CID of the pinned metadata JSON.
     */
    metadataCid?: string;
    /**
     * IPFS CID of the pinned avatar file, if applicable.
     */
    avatarCid?: string;
    /**
     * Hex-encoded transaction data for the setMetadata function call.
     */
    encodedData?: Hex;
    /**
     * Hash of the source action data for change detection.
     */
    sourceHash?: string;
    /**
     * Error if the pinning operation failed.
     */
    error?: Error;
}

export interface IUseMetadataActionPinReturn {
    /**
     * Function to pin multiple metadata actions in parallel.
     * @param actions - Array of metadata actions with their indices.
     * @returns Promise that resolves to an array of pin results.
     */
    pinMetadataActions: (
        actions: IMetadataActionWithIndex[],
    ) => Promise<IPinResult[]>;
    /**
     * Whether any pinning operations are currently in progress.
     */
    isPinning: boolean;
    /**
     * Map of action indices to errors for failed pinning operations.
     */
    pinErrors: Map<number, Error>;
    /**
     * Clear the error for a specific action index.
     * @param actionIndex - Index of the action to clear error for.
     */
    clearError: (actionIndex: number) => void;
    /**
     * Clear all pinning errors.
     */
    clearAllErrors: () => void;
}
