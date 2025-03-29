import { useMemo } from 'react';
import { erc20Abi } from 'viem';
import { useReadContracts } from 'wagmi';
import type { IUseTokenParams, IUseTokenResult } from './useToken.api';

export const useToken = (params: IUseTokenParams): IUseTokenResult => {
    const { address, chainId } = params;

    const { data, isError, isLoading } = useReadContracts({
        allowFailure: false,
        contracts: [
            { chainId, address, abi: erc20Abi, functionName: 'name' },
            { chainId, address, abi: erc20Abi, functionName: 'symbol' },
            { chainId, address, abi: erc20Abi, functionName: 'decimals' },
            { chainId, address, abi: erc20Abi, functionName: 'totalSupply' },
        ],
    });

    const token = useMemo(() => {
        if (data == null || isError) {
            return null;
        }

        const [name, symbol, decimals, totalSupply] = data;

        return { name, symbol, decimals, totalSupply: totalSupply.toString() };
    }, [data, isError]);

    return { token, isError, isLoading };
};
