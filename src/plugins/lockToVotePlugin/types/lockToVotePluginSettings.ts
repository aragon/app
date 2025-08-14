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
}
