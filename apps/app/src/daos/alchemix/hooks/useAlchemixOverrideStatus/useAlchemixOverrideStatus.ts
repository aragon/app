import { useCallback } from 'react';
import { type Hex, zeroAddress } from 'viem';
import { useReadContracts } from 'wagmi';
import type { VoteOption } from '@/plugins/tokenPlugin/types';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { alchemixTokenVotingAbi } from '../../constants';
import type { AlchemixOverrideErrReason } from '../../types';
import type {
    IAlchemixVoteRecord,
    IUseAlchemixOverrideStatusParams,
    IUseAlchemixOverrideStatusResult,
} from './useAlchemixOverrideStatus.api';

// The vote option used for the canVote / canOverrideVote permission probes, the checks only depend on the option
// not being none.
const probeVoteOption = 2;

interface IContractVoteRecord {
    voteOption: number;
    votingPower: bigint;
    reduction: bigint;
    hasOverridden: boolean;
    votedWithDelegatedVp: boolean;
}

const parseVoteRecord = (
    record?: IContractVoteRecord,
): IAlchemixVoteRecord | undefined =>
    record != null
        ? {
              voteOption:
                  record.voteOption > 0
                      ? (record.voteOption as VoteOption)
                      : undefined,
              votingPower: record.votingPower,
              reduction: record.reduction,
              hasOverridden: record.hasOverridden,
              votedWithDelegatedVp: record.votedWithDelegatedVp,
          }
        : undefined;

export const useAlchemixOverrideStatus = (
    params: IUseAlchemixOverrideStatusParams,
): IUseAlchemixOverrideStatusResult => {
    const { proposalIndex, pluginAddress, network, userAddress, enabled } =
        params;

    const { id: chainId } = networkDefinitions[network];

    const contractBase = {
        abi: alchemixTokenVotingAbi,
        address: pluginAddress as Hex,
        chainId,
    } as const;
    const proposalId = BigInt(proposalIndex);
    const user = userAddress as Hex;

    const {
        data: userData,
        isLoading: isUserDataLoading,
        isError: isUserDataError,
        refetch: refetchUserData,
    } = useReadContracts({
        contracts: [
            {
                ...contractBase,
                functionName: 'getAccountSnapshot',
                args: [proposalId, user, true],
            },
            {
                ...contractBase,
                functionName: 'getVoteRecord',
                args: [proposalId, user],
            },
            {
                ...contractBase,
                functionName: 'canOverrideVote',
                args: [proposalId, user, probeVoteOption],
            },
            {
                ...contractBase,
                functionName: 'canVote',
                args: [proposalId, user, probeVoteOption],
            },
        ],
        query: { enabled: enabled !== false && userAddress != null },
    });

    const accountSnapshot = userData?.[0]?.result;
    const userVoteRecord = userData?.[1]?.result;
    const canOverrideResult = userData?.[2]?.result;
    const canVote = userData?.[3]?.result === true;

    const delegatee = accountSnapshot?.delegatee;
    const delegatedVotingPower = accountSnapshot?.delegatedVp;
    const isEligible =
        delegatee != null &&
        delegatee !== zeroAddress &&
        delegatee.toLowerCase() !== userAddress?.toLowerCase() &&
        delegatedVotingPower != null &&
        delegatedVotingPower > BigInt(0);

    const {
        data: delegateeData,
        isLoading: isDelegateeDataLoading,
        isError: isDelegateeDataError,
        refetch: refetchDelegateeData,
    } = useReadContracts({
        contracts: [
            {
                ...contractBase,
                functionName: 'getVoteRecord',
                args: [proposalId, delegatee as Hex],
            },
        ],
        query: { enabled: enabled !== false && isEligible },
    });

    const refetch = useCallback(() => {
        void refetchUserData();
        void refetchDelegateeData();
    }, [refetchUserData, refetchDelegateeData]);

    return {
        isEligible,
        delegatee,
        delegatedVotingPower,
        userVoteRecord: parseVoteRecord(userVoteRecord),
        delegateeVoteRecord: parseVoteRecord(delegateeData?.[0]?.result),
        canOverride: canOverrideResult?.[0] === true,
        canOverrideErrReason: canOverrideResult?.[1] as
            | AlchemixOverrideErrReason
            | undefined,
        canVote,
        isLoading: isUserDataLoading || (isEligible && isDelegateeDataLoading),
        isError: isUserDataError || isDelegateeDataError,
        refetch,
    };
};
