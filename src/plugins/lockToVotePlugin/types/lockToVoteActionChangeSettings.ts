import type { IProposalActionChangeSettings as IGukProposalActionChangeSettings } from '@aragon/gov-ui-kit';
import type { LockToVoteProposalActionType } from './enum';
import type { ILockToVotePluginSettings } from './lockToVotePluginSettings';

export interface ILockToVoteActionChangeSettings
    extends Omit<IGukProposalActionChangeSettings, 'type' | 'proposedSettings' | 'existingSettings'> {
    /**
     * The type of the proposal action.
     */
    type: LockToVoteProposalActionType.UPDATE_VOTE_SETTINGS;
    /**
     * The proposed settings to be updated.
     */
    proposedSettings: Omit<ILockToVotePluginSettings, 'token'>;
    /**
     * The settings of the plugin at proposal creation.
     */
    existingSettings: Omit<ILockToVotePluginSettings, 'token'>;
}
