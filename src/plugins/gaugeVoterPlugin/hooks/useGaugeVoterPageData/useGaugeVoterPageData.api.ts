import type { Network } from '@/shared/api/daoService';
import type { Hex } from 'viem';
import type { IGaugeReturn } from '../../api/gaugeVoterService/domain';

export interface IUseGaugeVoterPageDataParams {
    /**
     * The gauge voter plugin address.
     */
    pluginAddress: Hex;
    /**
     * The network the plugin is deployed on.
     */
    network: Network;
    /**
     * Array of gauge addresses to fetch user votes for.
     */
    gaugeAddresses: Hex[];
    /**
     * Gauge data from backend (for fallback comparison).
     */
    gauges: IGaugeReturn[];
    /**
     * Total voting power for the epoch (from backend).
     */
    epochTotalVotingPower?: bigint;
    /**
     * Token decimals used for formatting values (defaults to 18).
     */
    tokenDecimals?: number;
    /**
     * Whether to enable the query.
     */
    enabled?: boolean;
}

export interface IGaugeVote {
    /**
     * The gauge address.
     */
    gaugeAddress: Hex;
    /**
     * User's votes on this gauge (as bigint for calculations).
     */
    votes: bigint;
    /**
     * Formatted vote amount for display.
     */
    formattedVotes: string;
    /**
     * Total votes on this gauge across all users (as bigint) - backend with RPC fallback.
     */
    totalVotes: bigint;
    /**
     * Formatted total vote amount for display (backend with RPC fallback).
     */
    formattedTotalVotes: string;
    /**
     * Numeric value for percentage calculations.
     */
    totalVotesValue: number;
}

export interface IVotingPowerData {
    /**
     * Raw bigint value for calculations.
     */
    raw: bigint;
    /**
     * Formatted string for display (e.g., "1.5K").
     */
    formatted: string;
    /**
     * Decimal number value (converted using token decimals).
     */
    value: number;
}

export interface IUseGaugeVoterPageDataResult {
    /**
     * User's total voting power.
     */
    votingPower: IVotingPowerData;
    /**
     * User's used voting power.
     */
    usedVotingPower: IVotingPowerData;
    /**
     * Epoch's total voting power.
     */
    epochVotingPower: IVotingPowerData;
    /**
     * Percentage of voting power used (0-1).
     */
    usagePercentage: number;
    /**
     * Whether the user has used all their voting power.
     */
    hasVoted: boolean;
    /**
     * User's votes per gauge.
     */
    gaugeVotes: IGaugeVote[];
    /**
     * Gauge addresses the user has voted for.
     */
    votedGaugeAddresses: readonly Hex[];
    /**
     * Whether the user is currently voting.
     */
    isVoting: boolean;
    /**
     * Whether the data is loading.
     */
    isLoading: boolean;
    /**
     * Refetch the data.
     */
    refetch: () => void;
}
