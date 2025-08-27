import { useMemo } from 'react';
import { erc20Abi } from 'viem';
import { useReadContracts } from 'wagmi';
import type { IUseTokenParams, IUseTokenResult } from './useToken.api';

export const useToken = (params: IUseTokenParams): IUseTokenResult => {
    const { address, chainId, enabled = true } = params;

    const { data, isLoading, isError } = useReadContracts({
        allowFailure: false,
        query: { enabled },
        contracts: [
            { chainId, address, abi: erc20Abi, functionName: 'name' },
            { chainId, address, abi: erc20Abi, functionName: 'symbol' },
            { chainId, address, abi: erc20Abi, functionName: 'decimals' },
            { chainId, address, abi: erc20Abi, functionName: 'totalSupply' },
        ],
    });

    const token = useMemo(() => {
        if (isLoading || data == null) {
            return null;
        }

        const [name, symbol, decimals, totalSupply] = data;

        return { name, symbol, decimals, totalSupply: totalSupply.toString() };
    }, [data, isLoading]);

    return { data: token, isError, isLoading };
};
