import { type IToken } from '@/modules/finance/api/financeService';
import type { IPluginSettings } from '@/shared/api/daoService';
import { type DaoTokenVotingMode } from './enum';

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
    token: IToken;
    /**
     * Total supply of the token only set when settings are fetched for a specific block number (e.g. settings when a proposal was created)
     */
    historicalTotalSupply?: string;
}
