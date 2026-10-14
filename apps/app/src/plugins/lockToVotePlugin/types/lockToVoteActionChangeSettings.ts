import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { LockToVoteProposalActionType } from './enum';
import type { ILockToVotePluginSettings } from './lockToVotePluginSettings';

export interface ILockToVoteActionChangeSettings extends IProposalAction {
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
