import type { IToken } from '@/modules/finance/api/financeService';
import { useMemo } from 'react';
import { erc20Abi, type Hash } from 'viem';
import { useReadContracts } from 'wagmi';
import type { ReadContractsErrorType } from 'wagmi/actions';

export interface IUseTokenParams {
    /**
     * Address of the token contract.
     */
    address: Hash;
    /**
     * Chain ID of the token contract.
     */
    chainId?: number;
}

export interface IUseTokenReturn extends Pick<IToken, 'decimals' | 'name' | 'symbol' | 'totalSupply'> {}

export interface UseTokenResult {
    /**
     * Token data result.
     */
    data: IUseTokenReturn | null;
    /**
     * Possible error result.
     */
    error: ReadContractsErrorType | null;
    /**
     * Whether the token data is loading.
     */
    isLoading: boolean;
}

export const useToken = (params: IUseTokenParams): UseTokenResult => {
    const { address, chainId = 1 } = params;

    const { data, error, isLoading } = useReadContracts({
        allowFailure: false,
        contracts: [
            { chainId, address, abi: erc20Abi, functionName: 'decimals' },
            { chainId, address, abi: erc20Abi, functionName: 'name' },
            { chainId, address, abi: erc20Abi, functionName: 'symbol' },
            { chainId, address, abi: erc20Abi, functionName: 'totalSupply' },
        ],
    }) as {
        data: [number, string, string, bigint] | undefined;
        error: ReadContractsErrorType | null;
        isLoading: boolean;
    };

    const token = useMemo(() => {
        if (!data || error) {
            return null;
        }

        const [decimals, name, symbol, totalSupply] = data;
        return { name, symbol, decimals, totalSupply: totalSupply.toString() };
    }, [data, error]);

    return {
        data: token,
        error,
        isLoading,
    };
};
