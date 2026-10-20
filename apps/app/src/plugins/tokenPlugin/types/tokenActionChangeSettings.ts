import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { TokenProposalActionType } from './enum';
import type { ITokenPluginSettings } from './tokenPluginSettings';

export interface ITokenActionChangeSettings extends IProposalAction {
    /**
     * The type of the proposal action.
     */
    type: TokenProposalActionType.UPDATE_VOTE_SETTINGS;
    /**
     * The proposed settings to be updated.
     */
    proposedSettings: Omit<ITokenPluginSettings, 'token'>;
    /**
     * The settings of the plugin at proposal creation.
     */
    existingSettings: Omit<ITokenPluginSettings, 'token'>;
}
