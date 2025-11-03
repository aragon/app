import type { Network } from '@/shared/api/daoService';
import type { Hex } from 'viem';

export interface IUseGaugeVoterUserDataParams {
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
     * Whether to enable the query.
     */
    enabled?: boolean;
    /**
     * User's total voting power from backend (preferred source).
     * If provided, RPC call for voting power is skipped.
     */
    backendVotingPower?: string;
    /**
     * User's used voting power from backend (preferred source).
     * If provided, RPC call for used voting power is skipped.
     */
    backendUsedVotingPower?: string;
}

export interface IGaugeUserVote {
    /**
     * The gauge address.
     */
    gaugeAddress: Hex;
    /**
     * User's votes on this gauge.
     */
    userVotes: bigint;
}

export interface IUseGaugeVoterUserDataResult {
    /**
     * User's total voting power from the ivotesAdapter contract.
     */
    votingPower: bigint;
    /**
     * User's used voting power (how much they've already voted with).
     */
    usedVotingPower: bigint;
    /**
     * User's votes per gauge.
     */
    gaugeVotes: IGaugeUserVote[];
    /**
     * Whether the data is loading.
     */
    isLoading: boolean;
    /**
     * Refetch the data.
     */
    refetch: () => void;
}
