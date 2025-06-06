import { useReadContract } from 'wagmi';
import type { IUseTokenParams } from '../useToken';

export const erc20DelegatesAbi = [
    {
        type: 'function',
        name: 'delegates',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'address' }],
    },
] as const;

export interface IUseGovernanceTokenDelegationCheckParams extends IUseTokenParams {}

export const useGovernanceTokenDelegationCheck = (params: IUseGovernanceTokenDelegationCheckParams) => {
    const { address, chainId, enabled = true } = params;

    const { data, isLoading } = useReadContract({
        query: { enabled },
        chainId,
        address,
        abi: erc20DelegatesAbi,
        functionName: 'delegates',
        args: ['0x0000000000000000000000000000000000000001'],
    });

    return { isLoading, isError: false, data: data != null };
};
