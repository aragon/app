import { type IProposalAction } from '@/modules/governance/api/governanceService';
import { type IDaoPluginMetadata } from '@/shared/api/daoService';
import { type TokenProposalActionType } from './enum';

export interface ITokenActionUpdateMetadata extends Omit<IProposalAction, 'type' | 'proposedMetadata' | 'existingMetadata'> {
    /**
     * The type of the proposal action.
     */
    type: TokenProposalActionType.UPDATE_PLUGIN_METADATA;
    /**
     * The proposed metadata to be updated.
     */
    proposedMetadata: IDaoPluginMetadata;
}
