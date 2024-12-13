import type { ProposalActionType } from '@/modules/governance/api/governanceService';
import type { IResource } from '@/shared/api/daoService';
import { type IProposalActionUpdateMetadata as IGukProposalActionUpdateMetadata } from '@aragon/gov-ui-kit';

export interface IProposalActionUpdatePluginMetadataObject {
    /**
     * The name of the plugin.
     */
    name?: string;
    /**
     * The key of the plugin.
     */
    processKey?: string;
    /**
     * Summary of the plugin.
     */
    description?: string;
    /**
     * Resources of the plugin.
     */
    links?: IResource[];
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
    proposedMetadata: IProposalActionUpdatePluginMetadataObject;
    /**
     * The existing metadata.
     */
    existingMetadata: IProposalActionUpdatePluginMetadataObject;
}
