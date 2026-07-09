import type { Hex } from 'viem';
import { useReadContracts } from 'wagmi';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type {
    IUseLockToVoteLockOnboardingCheckParams,
    IUseLockToVoteLockOnboardingCheckResult,
} from './useLockToVoteLockOnboardingCheck.api';

const getLockedBalanceAbi = [
    {
        type: 'function',
        name: 'getLockedBalance',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ type: 'uint256' }],
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

export const useLockToVoteLockOnboardingCheck = (
    params: IUseLockToVoteLockOnboardingCheckParams,
): IUseLockToVoteLockOnboardingCheckResult => {
    const { lockManagerAddress, tokenAddress, userAddress, network, enabled } =
        params;

    const { id: chainId } = networkDefinitions[network];

    const isEnabled =
        enabled !== false &&
        lockManagerAddress != null &&
        tokenAddress != null &&
        userAddress != null;

    const { data, isLoading } = useReadContracts({
        contracts: [
            {
                abi: getLockedBalanceAbi,
                address: lockManagerAddress as Hex,
                functionName: 'getLockedBalance',
                args: [userAddress as Hex],
                chainId,
            },
            {
                abi: balanceOfAbi,
                address: tokenAddress as Hex,
                functionName: 'balanceOf',
                args: [userAddress as Hex],
                chainId,
            },
        ],
        query: { enabled: isEnabled },
    });

    const lockedBalance = data?.[0]?.result;
    const balance = data?.[1]?.result;

    const hasNoLockedBalance =
        lockedBalance != null && lockedBalance === BigInt(0);
    const hasBalance = balance != null && balance > BigInt(0);

    const shouldTrigger = !isLoading && hasNoLockedBalance && hasBalance;

    return { shouldTrigger, isLoading };
};
