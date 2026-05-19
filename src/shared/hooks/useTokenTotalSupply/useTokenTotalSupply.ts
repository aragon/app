import { erc20Abi, type Hex } from 'viem';
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
        address: address as Hex | undefined,
        abi: erc20Abi,
        functionName: 'totalSupply',
        query: { enabled: enabled && address != null && chainId != null },
    });

    return { data, isError, isLoading };
};
