import { useMemo } from 'react';
import { erc20Abi } from 'viem';
import { useReadContract, useReadContracts } from 'wagmi';
import type { IUseTokenParams, IUseTokenResult } from './useLockToVoteErc20Token.api';

// Fallback to "unknown" token when token passes the ERC20 checks but has no valid token attributes
const tokenFallback: IUseTokenResult['data'] = { name: 'Unknown', decimals: 18, symbol: 'UNKNOWN', totalSupply: '0' };

export const useLockToVoteErc20Token = (params: IUseTokenParams): IUseTokenResult => {
    const { address, chainId, enabled = true } = params;

    const {
        data: rawData,
        isLoading: metaLoading,
        isError: metaError,
    } = useReadContracts({
        allowFailure: false,
        query: { enabled },
        contracts: [
            { chainId, address, abi: erc20Abi, functionName: 'name' },
            { chainId, address, abi: erc20Abi, functionName: 'symbol' },
            { chainId, address, abi: erc20Abi, functionName: 'decimals' },
            { chainId, address, abi: erc20Abi, functionName: 'totalSupply' },
        ],
    });

    const tokenMeta = useMemo(() => {
        if (metaLoading || rawData == null) {
            return null;
        }
        const [name, symbol, decimals, totalSupply] = rawData;
        return { name, symbol, decimals, totalSupply: totalSupply.toString() };
    }, [rawData, metaLoading]);

    const {
        data: balance,
        isLoading: erc20Loading,
        isError: erc20Error,
    } = useReadContract({
        query: { enabled },
        chainId,
        address,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: ['0x0000000000000000000000000000000000000001'],
    });

    const isErc20Token = !erc20Loading && !erc20Error && balance != null;

    const token = isErc20Token ? (tokenMeta ?? tokenFallback) : null;

    if (token) {
        token.name = token.name || tokenFallback.name;
        token.symbol = token.symbol || tokenFallback.symbol;
    }

    const isLoading = metaLoading || erc20Loading;
    const isError = metaError || erc20Error;

    return { data: token, isLoading, isError };
};
