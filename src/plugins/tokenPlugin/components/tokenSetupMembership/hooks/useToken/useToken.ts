import { useMemo } from 'react';
import { erc20Abi } from 'viem';
import { useReadContracts } from 'wagmi';
import type { IUseTokenParams, IUseTokenResult } from './useToken.api';

const BALANCE_CHECK_ADDRESS = '0xdead000000000000000000000000000000000000';

export const useToken = (params: IUseTokenParams): IUseTokenResult => {
    const { address, chainId } = params;

    const { isError: balanceOfError, isLoading: balanceOfLoading } = useReadContracts({
        allowFailure: false,
        contracts: [
            {
                chainId,
                address,
                abi: erc20Abi,
                functionName: 'balanceOf',
                args: [BALANCE_CHECK_ADDRESS],
            },
        ],
    });

    const { data: metaData, isLoading: metaLoading } = useReadContracts({
        allowFailure: true,
        contracts: [
            { chainId, address, abi: erc20Abi, functionName: 'name' },
            { chainId, address, abi: erc20Abi, functionName: 'symbol' },
            { chainId, address, abi: erc20Abi, functionName: 'decimals' },
            { chainId, address, abi: erc20Abi, functionName: 'totalSupply' },
        ],
    });

    const token = useMemo(() => {
        if (balanceOfError || metaData == null) {
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
        const decimals = decimalsRes.status === 'success' ? decimalsRes.result : 18;
        const totalSupply = totalSupplyRes.status === 'success' ? totalSupplyRes.result.toString() : '0';

        return { name, symbol, decimals, totalSupply };
    }, [balanceOfError, metaData]);

    return {
        token,
        isError: balanceOfError,
        isLoading: balanceOfLoading || metaLoading,
    };
};
