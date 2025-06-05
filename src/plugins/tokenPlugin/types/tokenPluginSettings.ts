import type { IPluginSettings } from '@/shared/api/daoService';
import type { DaoTokenVotingMode } from './enum';
import type { ITokenPluginSettingsToken } from './tokenPluginSettingsToken';

export interface EscrowSettings {
    /**
     * The minimum amount required to lock.
     */
    minDeposit: string;
    /**
     * The minimum lock time before unlocking is available.
     */
    minLockTime: number;
    /**
     * The time in seconds between unlock and withdrawal.
     */
    cooldown: number;
    /**
     * The maximum time the voting power can increase.
     */
    maxTime: number;
    /**
     * The coefficient used to calculate the voting power increase over time.
     */
    slope: number;
}

export interface ITokenPluginSettings extends IPluginSettings {
    /**
     * Amount of tokens that need to vote "Yes" for a proposal to pass.
     */
    supportThreshold: number;
    /**
     * Amount of tokens that need to participate in a vote for it to be valid.
     */
    minParticipation: number;
    /**
     * Minimum amount of time a proposal can be live.
     */
    minDuration: number;
    /**
     * Amount of tokens a member needs to hold in order to create a proposal.
     */
    minProposerVotingPower: string;
    /**
     * Voting mode of the DAO.
     */
    votingMode: DaoTokenVotingMode;
    /**
     * Governance token of the DAO.
     */
    token: ITokenPluginSettingsToken;
    /**
     * Total supply of the token only set when settings are fetched for a specific block number (e.g. settings when a proposal was created)
     */
    historicalTotalSupply?: string;
    /**
     * The settings of the voting escrow
     */
    votingEscrow?: EscrowSettings;
}
