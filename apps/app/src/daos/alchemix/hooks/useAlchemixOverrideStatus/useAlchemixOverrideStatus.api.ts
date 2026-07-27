import type { Address } from 'viem';
import type { VoteOption } from '@/plugins/tokenPlugin/types';
import type { Network } from '@/shared/api/daoService';
import type { AlchemixOverrideErrReason } from '../../types';

export interface IUseAlchemixOverrideStatusParams {
    /**
     * The incremental ID of the proposal.
     */
    proposalIndex: string;
    /**
     * Address of the token-voting plugin the proposal has been created on.
     */
    pluginAddress: string;
    /**
     * The network of the proposal.
     */
    network: Network;
    /**
     * Address of the connected user.
     */
    userAddress?: string;
    /**
     * Whether the queries should be enabled.
     */
    enabled?: boolean;
}

export interface IAlchemixVoteRecord {
    /**
     * The account's current recorded vote option, none when the account never voted or has been fully overridden.
     */
    voteOption: VoteOption | undefined;
    /**
     * The voting power currently counted for the account in the proposal tally.
     */
    votingPower: bigint;
    /**
     * Voting power reclaimed from the account by its delegators through override votes.
     */
    reduction: bigint;
    /**
     * Whether the account has overridden its delegate's vote on the proposal.
     */
    hasOverridden: boolean;
    /**
     * Whether the account has voted with the voting power delegated to it (normal, non-override vote).
     */
    votedWithDelegatedVp: boolean;
}

export interface IUseAlchemixOverrideStatusResult {
    /**
     * Whether the override feature applies to the connected user: their balance at the proposal snapshot is
     * delegated to an address other than themselves or the zero address.
     */
    isEligible: boolean;
    /**
     * The user's delegate at the proposal snapshot.
     */
    delegatee?: Address;
    /**
     * The voting power the user delegated out at the proposal snapshot.
     */
    delegatedVotingPower?: bigint;
    /**
     * The vote record of the user on the proposal.
     */
    userVoteRecord?: IAlchemixVoteRecord;
    /**
     * The vote record of the user's delegate on the proposal.
     */
    delegateeVoteRecord?: IAlchemixVoteRecord;
    /**
     * Whether the user is currently allowed to cast an override vote.
     */
    canOverride: boolean;
    /**
     * The reason the user cannot cast an override vote.
     */
    canOverrideErrReason?: AlchemixOverrideErrReason;
    /**
     * Whether the user is currently allowed to cast a normal vote (needed for the atomic vote-and-override).
     */
    canVote: boolean;
    /**
     * Whether any of the queries is loading.
     */
    isLoading: boolean;
    /**
     * Defines if an error occurred while fetching the override status.
     */
    isError: boolean;
    /**
     * Refetches all the underlying contract reads.
     */
    refetch: () => void;
}
