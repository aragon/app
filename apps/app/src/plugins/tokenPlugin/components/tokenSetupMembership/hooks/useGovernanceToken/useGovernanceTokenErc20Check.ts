import { erc20Abi } from 'viem';
import { useReadContract } from 'wagmi';
import type { IUseTokenParams } from '@/shared/hooks/useToken';

export interface IUseGovernanceTokenErc20CheckParams extends IUseTokenParams {}

export const useGovernanceTokenErc20Check = (
    params: IUseGovernanceTokenErc20CheckParams,
) => {
    const { address, chainId, enabled = true } = params;

    const { data, isError, isLoading } = useReadContract({
        query: { enabled },
        chainId,
        address,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: ['0x0000000000000000000000000000000000000001'],
    });

    return { isLoading, isError, data: data != null };
};
