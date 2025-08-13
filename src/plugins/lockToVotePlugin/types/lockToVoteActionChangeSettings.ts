import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { type IProposalActionChangeSettings as IGukProposalActionChangeSettings } from '@aragon/gov-ui-kit';
import type { LockToVoteProposalActionType } from './enums';

export interface ILockToVoteActionChangeSettings
    extends Omit<IGukProposalActionChangeSettings, 'type' | 'proposedSettings' | 'existingSettings'> {
    /**
     * The type of the proposal action.
     */
    type: LockToVoteProposalActionType.UPDATE_LOCK_TO_VOTE_VOTE_SETTINGS;
    /**
     * The proposed settings to be updated.
     */
    proposedSettings: Omit<ITokenPluginSettings, 'token'>;
    /**
     * The settings of the plugin at proposal creation.
     */
    existingSettings: Omit<ITokenPluginSettings, 'token'>;
}
