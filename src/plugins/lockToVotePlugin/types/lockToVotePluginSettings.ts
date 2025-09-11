import { type ITokenPluginSettings } from '../../tokenPlugin/types';
import type { DaoLockToVoteVotingMode } from './enum';
import type { ILockToVotePluginSettingsToken } from './lockToVotePluginSettingsToken';

export interface ILockToVotePluginSettings extends Omit<ITokenPluginSettings, 'votingMode' | 'token' | 'votingEscrow'> {
    /**
     * Voting mode of the DAO.
     */
    votingMode: DaoLockToVoteVotingMode;
    /**
     * Governance token of the DAO.
     */
    token: ILockToVotePluginSettingsToken;
    /**
     * The minimum ratio of approvals the proposal needs to succeed. Different from supportThreshold.
     * Not currently used in the App, set to 0 by default.
     */
    minApprovalRatio: number;
}
