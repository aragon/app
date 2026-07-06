import type { Hex } from 'viem';
import { useReadContracts } from 'wagmi';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type {
    IUseTokenLockAndWrapOnboardingCheckParams,
    IUseTokenLockAndWrapOnboardingCheckResult,
} from './useTokenLockAndWrapOnboardingCheck.api';

const getVotesAbi = [
    {
        type: 'function',
        name: 'getVotes',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
    },
] as const;

const balanceOfAbi = [
    {
        type: 'function',
        name: 'balanceOf',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
    },
] as const;

export const useTokenLockAndWrapOnboardingCheck = (
    params: IUseTokenLockAndWrapOnboardingCheckParams,
): IUseTokenLockAndWrapOnboardingCheckResult => {
    const {
        governanceTokenAddress,
        underlyingTokenAddress,
        userAddress,
        network,
        enabled,
    } = params;

    const { id: chainId } = networkDefinitions[network];

    const isEnabled =
        enabled !== false &&
        governanceTokenAddress != null &&
        underlyingTokenAddress != null &&
        userAddress != null;

    const { data, isLoading } = useReadContracts({
        contracts: [
            {
                abi: getVotesAbi,
                address: governanceTokenAddress as Hex,
                functionName: 'getVotes',
                args: [userAddress as Hex],
                chainId,
            },
            {
                abi: balanceOfAbi,
                address: underlyingTokenAddress as Hex,
                functionName: 'balanceOf',
                args: [userAddress as Hex],
                chainId,
            },
        ],
        query: { enabled: isEnabled },
    });

    const votes = data?.[0]?.result;
    const balance = data?.[1]?.result;

    const hasNoVotes = votes != null && votes === BigInt(0);
    const hasBalance = balance != null && balance > BigInt(0);

    const shouldTrigger = !isLoading && hasNoVotes && hasBalance;

    return { shouldTrigger, isLoading };
};
