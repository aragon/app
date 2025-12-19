import { type Hex, zeroAddress } from 'viem';
import { useReadContract } from 'wagmi';
import { votingEscrowAbi } from '../../utils/tokenExitQueueTransactionUtils/votingEscrowAbi';
import type {
    IUseTokenVotingEscrowTokenIdParams,
    IUseTokenVotingEscrowTokenIdReturn,
} from './useTokenVotingEscrowTokenId.api';

/**
 * Hook to retrieve the tokenId for a user's lock in the VotingEscrow contract.
 * VotingEscrow implements ERC-721 where each lock is represented as an NFT.
 * This hook assumes each user has at most one tokenId (index 0).
 */
export const useTokenVotingEscrowTokenId = (
    params: IUseTokenVotingEscrowTokenIdParams,
): IUseTokenVotingEscrowTokenIdReturn => {
    const { escrowAddress, userAddress, chainId, enabled = true } = params;
    const normalizedUserAddress: Hex = userAddress ?? zeroAddress;

    // First check if the user has any tokens
    const { data: balance, isLoading: isBalanceLoading } = useReadContract({
        abi: votingEscrowAbi,
        functionName: 'balanceOf',
        address: escrowAddress,
        args: [normalizedUserAddress],
        chainId,
        query: {
            enabled: enabled && userAddress != null,
        },
    });

    const hasTokens = balance != null && balance > BigInt(0);

    // If user has at least one token, get the first one (index 0)
    const {
        data: tokenId,
        isLoading: isTokenIdLoading,
        refetch,
    } = useReadContract({
        abi: votingEscrowAbi,
        functionName: 'tokenOfOwnerByIndex',
        address: escrowAddress,
        args: [normalizedUserAddress, BigInt(0)],
        chainId,
        query: {
            enabled: enabled && userAddress != null && hasTokens,
        },
    });

    return {
        tokenId,
        isLoading: isBalanceLoading || isTokenIdLoading,
        refetch,
    };
};
