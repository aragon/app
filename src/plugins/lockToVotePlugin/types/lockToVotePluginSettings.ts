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
    /**
     * Maximum/base fee percent charged on exit (in basis points, 0-10000 where 10000 = 100%).
     * In Dynamic mode: fee immediately after minCooldown.
     * In Tiered mode: early exit fee.
     * In Fixed mode: the only fee.
     */
    feePercent: number;
    /**
     * Minimum fee percent charged after full cooldown (in basis points, 0-10000).
     * In Dynamic mode: fee after full cooldown.
     * In Tiered mode: normal exit fee.
     * In Fixed mode: same as feePercent.
     */
    minFeePercent: number;
    /**
     * Full cooldown period in seconds.
     * After this time from queuing, the minimum fee applies.
     */
    cooldown: number;
    /**
     * Minimum cooldown period in seconds.
     * Minimum time the user must wait before any exit is allowed.
     */
    minCooldown: number;
}
