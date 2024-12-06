import { type IProposalAction } from '@/modules/governance/api/governanceService';
import { type IDaoPluginMetadata } from '@/shared/api/daoService';
import { type SppProposalActionType } from './enum';

export interface ISppActionUpdateMetadata extends Omit<IProposalAction, 'type' | 'proposedMetadata' | 'existingMetadata'> {
    /**
     * The type of the proposal action.
     */
    type: SppProposalActionType.UPDATE_PLUGIN_METADATA;
    /**
     * The proposed metadata to be updated.
     */
    proposedMetadata: IDaoPluginMetadata;
}
