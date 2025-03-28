import type { IToken } from '@/modules/finance/api/financeService';
import { useMemo } from 'react';
import { erc20Abi, type Hash } from 'viem';
import { useReadContracts } from 'wagmi';

export interface IUseTokenParams {
    /**
     * Address of the token contract.
     */
    address: Hash;
    /**
     * Chain ID of the token contract.
     */
    chainId: number;
}

export interface IUseTokenReturn extends Pick<IToken, 'decimals' | 'name' | 'symbol' | 'totalSupply'> {}

export interface IUseTokenResult {
    /**
     * Token data result.
     */
    token: IUseTokenReturn | null;
    /**
     * Possible error result.
     */
    isError: boolean;
    /**
     * Whether the token data is loading.
     */
    isLoading: boolean;
}

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

    const token = useMemo<IUseTokenReturn | null>(() => {
        if (data == null || isError) {
            return null;
        }

        return {
            name: data[0],
            symbol: data[1],
            decimals: data[2],
            totalSupply: data[3].toString(),
        };
    }, [data, isError]);

    return {
        token,
        isError,
        isLoading,
    };
};
