import type { ProposalActionType } from '@/modules/governance/api/governanceService';
import type { IResource } from '@/shared/api/daoService';
import { type IProposalActionUpdateMetadata as IGukProposalActionUpdateMetadata } from '@aragon/gov-ui-kit';

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

export interface IProposalActionUpdatePluginMetadata
    extends Omit<IGukProposalActionUpdateMetadata, 'type' | 'proposedMetadata' | 'existingMetadata'> {
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
