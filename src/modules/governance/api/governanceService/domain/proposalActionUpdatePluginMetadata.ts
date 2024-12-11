import type { IProposalAction, ProposalActionType } from '@/modules/governance/api/governanceService';
import type { IResource } from '@/shared/api/daoService';

export interface IDaoPluginMetadataObject {
    /**
     * The name of the plugin/process.
     */
    name?: string;
    /**
     * The key of the plugin/process.
     */
    processKey?: string;
    /**
     * Summary of the plugin/process.
     */
    summary?: string;
    /**
     * Resources of the plugin/process.
     */
    resources?: IResource[];
}

// TODO: Update the interface once we have gov-kit updates
export interface IProposalActionUpdatePluginMetadata
    extends Omit<IProposalAction, 'type' | 'proposedMetadata' | 'existingMetadata'> {
    /**
     * The type of the proposal action.
     */
    type: ProposalActionType.METADATA_PLUGIN_UPDATE;
    /**
     * The proposed metadata to be updated.
     */
    proposedMetadata: IDaoPluginMetadataObject;
    /**
     * The existing metadata.
     */
    existingMetadata: IDaoPluginMetadataObject;
}
