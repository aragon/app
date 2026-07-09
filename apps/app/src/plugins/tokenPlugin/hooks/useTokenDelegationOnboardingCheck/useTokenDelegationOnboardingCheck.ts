import type { Hex } from 'viem';
import { zeroAddress } from 'viem';
import { useReadContracts } from 'wagmi';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type {
    IUseTokenDelegationOnboardingCheckParams,
    IUseTokenDelegationOnboardingCheckResult,
} from './useTokenDelegationOnboardingCheck.api';

const delegatesAbi = [
    {
        type: 'function',
        name: 'delegates',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'address' }],
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

export const useTokenDelegationOnboardingCheck = (
    params: IUseTokenDelegationOnboardingCheckParams,
): IUseTokenDelegationOnboardingCheckResult => {
    const { tokenAddress, userAddress, network, enabled } = params;

    const { id: chainId } = networkDefinitions[network];

    const isEnabled =
        enabled !== false && tokenAddress != null && userAddress != null;

    const { data, isLoading } = useReadContracts({
        contracts: [
            {
                abi: delegatesAbi,
                address: tokenAddress as Hex,
                functionName: 'delegates',
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

    const delegate = data?.[0]?.result;
    const balance = data?.[1]?.result;

    const isDelegateZero = delegate == null || delegate === zeroAddress;
    const hasBalance = balance != null && balance > BigInt(0);

    const shouldTrigger = !isLoading && isDelegateZero && hasBalance;

    return { shouldTrigger, isLoading };
};
