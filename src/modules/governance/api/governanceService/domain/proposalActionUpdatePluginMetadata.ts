import { type IProposalAction, type ProposalActionType } from '@/modules/governance/api/governanceService';
import { type IDaoPluginMetadata } from '@/shared/api/daoService';

export interface IProposalActionUpdatePluginMetadata
    extends Omit<IProposalAction, 'type' | 'proposedMetadata' | 'existingMetadata'> {
    /**
     * The type of the proposal action.
     */
    type: ProposalActionType.METADATA_UPDATE;
    /**
     * The proposed metadata to be updated.
     */
    proposedMetadata: IDaoPluginMetadata;
}
