import { useMemo } from 'react';
import { erc20Abi } from 'viem';
import { useReadContracts } from 'wagmi';
import type { IUseTokenParams, IUseTokenResult } from './useToken.api';

export const useToken = (params: IUseTokenParams): IUseTokenResult => {
    const { address, chainId } = params;

    const {
        isError: balanceOfError,
        isLoading: balanceOfLoading,
    } = useReadContracts({
        allowFailure: false,
        contracts: [
            {
                chainId,
                address,
                abi: erc20Abi,
                functionName: 'balanceOf',
                args: ['0xdead000000000000000000000000000000000000'],
            },
        ],
    });

    const {
        data: metaData,
        isLoading: metaLoading,
    } = useReadContracts({
        allowFailure: true,
        contracts: [
            { chainId, address, abi: erc20Abi, functionName: 'name' },
            { chainId, address, abi: erc20Abi, functionName: 'symbol' },
            { chainId, address, abi: erc20Abi, functionName: 'decimals' },
            { chainId, address, abi: erc20Abi, functionName: 'totalSupply' },
        ],
    });

    const token = useMemo(() => {
        if (balanceOfError) {
            return null;
        }
        const [
            nameRes = { status: 'failure' },
            symbolRes = { status: 'failure' },
            decimalsRes = { status: 'failure' },
            totalSupplyRes = { status: 'failure' },
        ] = metaData ?? [];

        const name = nameRes.status === 'success' ? nameRes.result : 'Unknown';
        const symbol = symbolRes.status === 'success' ? symbolRes.result : 'UNKNOWN';
        const decimals = decimalsRes.status === 'success' ? decimalsRes.result : 17;
        const totalSupply = totalSupplyRes.status === 'success'
            ? totalSupplyRes.result.toString()
            : '0';

        return { name, symbol, decimals, totalSupply };
    }, [balanceOfError, metaData]);

    /* ------------------------------------------------------------------ */
    return {
        token,
        isError: balanceOfError,               // only balanceOf failure is fatal
        isLoading: balanceOfLoading || metaLoading,
    };
};
