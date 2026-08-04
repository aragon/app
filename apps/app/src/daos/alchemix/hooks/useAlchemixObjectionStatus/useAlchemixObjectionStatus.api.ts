import type { VoteOption } from '@/plugins/tokenPlugin/types';
import type { Network } from '@/shared/api/daoService';

export interface IUseAlchemixObjectionStatusParams {
    /**
     * The incremental ID of the proposal.
     */
    proposalIndex: string;
    /**
     * Address of the objection plugin the proposal has been created on.
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

export interface IUseAlchemixObjectionStatusResult {
    /**
     * The option the user is recorded with, falling back to the option they voted on the first stage when they
     * never objected. Undefined when they voted on neither stage.
     */
    voteOption?: VoteOption;
    /**
     * The voting power of the user at the proposal snapshot.
     */
    votingPower: bigint;
    /**
     * Whether the user is allowed to object.
     */
    canObject: boolean;
    /**
     * Whether the reads are loading.
     */
    isLoading: boolean;
    /**
     * Whether the reads have settled at least once.
     */
    isFetched: boolean;
    /**
     * Whether the reads failed.
     */
    isError: boolean;
    /**
     * Refetches the reads.
     */
    refetch: () => void;
}
