import { erc20Abi } from 'viem';
import { useReadContract } from 'wagmi';
import type {
    IUseTokenTotalSupplyParams,
    IUseTokenTotalSupplyResult,
} from './useTokenTotalSupply.api';

export const useTokenTotalSupply = (
    params: IUseTokenTotalSupplyParams,
): IUseTokenTotalSupplyResult => {
    const { address, chainId, enabled = true } = params;

    const { data, isError, isLoading } = useReadContract({
        chainId,
        address,
        abi: erc20Abi,
        functionName: 'totalSupply',
        query: { enabled },
    });

    return { data, isError, isLoading };
};
