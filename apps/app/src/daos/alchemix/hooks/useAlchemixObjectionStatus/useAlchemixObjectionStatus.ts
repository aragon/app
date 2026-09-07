import { useCallback } from 'react';
import type { Hex } from 'viem';
import { useReadContracts } from 'wagmi';
import { VoteOption } from '@/plugins/tokenPlugin/types';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { alchemixObjectionAbi } from '../../constants/alchemixObjectionAbi';
import type {
    IUseAlchemixObjectionStatusParams,
    IUseAlchemixObjectionStatusResult,
} from './useAlchemixObjectionStatus.api';

export const useAlchemixObjectionStatus = (
    params: IUseAlchemixObjectionStatusParams,
): IUseAlchemixObjectionStatusResult => {
    const { proposalIndex, pluginAddress, network, userAddress, enabled } =
        params;

    const { id: chainId } = networkDefinitions[network];

    const contractBase = {
        abi: alchemixObjectionAbi,
        address: pluginAddress as Hex,
        chainId,
    } as const;
    const proposalId = BigInt(proposalIndex);
    const user = userAddress as Hex;

    const {
        data,
        isLoading,
        isFetched,
        isError,
        refetch: refetchReads,
    } = useReadContracts({
        contracts: [
            {
                ...contractBase,
                functionName: 'getVoteOption',
                args: [proposalId, user],
            },
            {
                ...contractBase,
                functionName: 'getPastVotesAtProposalSnapshot',
                args: [proposalId, user],
            },
            {
                // The objection plugin rejects every option but "No", so the permission probe has to use it.
                ...contractBase,
                functionName: 'canVote',
                args: [proposalId, user, VoteOption.NO],
            },
        ],
        query: { enabled: enabled !== false && userAddress != null },
    });

    const voteOption = data?.[0]?.result;
    // The batch resolves with a per-read status, so a single failed read must be surfaced as an error instead of
    // being mistaken for a zero voting power or a denied objection permission.
    const hasFailedRead =
        data?.some((read) => read.status === 'failure') === true;

    const refetch = useCallback(() => {
        void refetchReads();
    }, [refetchReads]);

    return {
        voteOption:
            voteOption != null && voteOption > 0
                ? (voteOption as VoteOption)
                : undefined,
        votingPower: data?.[1]?.result ?? BigInt(0),
        canObject: data?.[2]?.result === true,
        isLoading,
        isFetched,
        isError: isError || hasFailedRead,
        refetch,
    };
};
