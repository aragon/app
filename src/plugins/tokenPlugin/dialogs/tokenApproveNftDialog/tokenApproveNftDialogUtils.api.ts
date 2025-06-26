import type { Hex } from 'viem';

export interface IBuildApproveNftTransactionParams {
    /**
     * The NFT token contract address.
     */
    tokenAddress: Hex;
    /**
     * The ID of the token to approve.
     */
    tokenId: bigint;
    /**
     * Spender address used in the approve function.
     */
    spender: Hex;
}
