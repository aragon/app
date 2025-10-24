import type { Hex } from 'viem';

export interface IUseLockToVoteTokenIdParams {
    /**
     * Address of the VotingEscrow contract.
     */
    escrowAddress: Hex;
    /**
     * User wallet address to get tokenId for.
     */
    userAddress?: Hex;
    /**
     * Chain ID for the network.
     */
    chainId: number;
    /**
     * Whether the query should be enabled.
     */
    enabled?: boolean;
}

export interface IUseLockToVoteTokenIdReturn {
    /**
     * The tokenId for the user's lock (undefined if no lock exists).
     */
    tokenId?: bigint;
    /**
     * Whether the hook is currently loading data.
     */
    isLoading: boolean;
    /**
     * Refetch function to manually refresh the data.
     */
    refetch: () => void;
}
