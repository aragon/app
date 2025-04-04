import { type IProposalActionChangeSettings as IGukProposalActionChangeSettings } from '@aragon/gov-ui-kit';
import type { TokenProposalActionType } from './enum';
import type { ITokenPluginSettings } from './tokenPluginSettings';

export interface ITokenActionChangeSettings
    extends Omit<IGukProposalActionChangeSettings, 'type' | 'proposedSettings' | 'existingSettings'> {
    /**
     * The type of the proposal action.
     */
    type: TokenProposalActionType.UPDATE_VOTE_SETTINGS;
    /**
     * The existing settings prior to the action updates.
     */
    existingSettings: ITokenPluginSettings;
    /**
     * The proposed settings to be updated.
     */
    proposedSettings: ITokenPluginSettings;
}
