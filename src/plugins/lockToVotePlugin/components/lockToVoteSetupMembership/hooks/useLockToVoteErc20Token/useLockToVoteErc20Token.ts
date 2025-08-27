import type {
    IUseTokenParams,
    IUseTokenResult,
} from '@/plugins/tokenPlugin/components/tokenSetupMembership/hooks/useToken';
import { useMemo } from 'react';
import { erc20Abi } from 'viem';
import { useReadContracts } from 'wagmi';

// Fallback to "unknown" token when token passes the ERC20 checks but has no valid token attributes
const tokenFallback: IUseTokenResult['data'] = { name: 'Unknown', decimals: 18, symbol: 'UNKNOWN', totalSupply: '0' };

export const useLockToVoteErc20Token = (params: IUseTokenParams): IUseTokenResult => {
    const { address, chainId, enabled = true } = params;

    const { data, isLoading, isError } = useReadContracts({
        allowFailure: false,
        query: { enabled },
        contracts: [
            { chainId, address, abi: erc20Abi, functionName: 'name' },
            { chainId, address, abi: erc20Abi, functionName: 'symbol' },
            { chainId, address, abi: erc20Abi, functionName: 'decimals' },
            { chainId, address, abi: erc20Abi, functionName: 'totalSupply' },
            {
                chainId,
                address,
                abi: erc20Abi,
                functionName: 'balanceOf',
                args: ['0x0000000000000000000000000000000000000001'],
            },
        ],
    });

    const tokenMeta = useMemo(() => {
        if (isLoading || data == null) {
            return null;
        }
        const [name, symbol, decimals, totalSupply] = data;
        return { name, symbol, decimals, totalSupply: totalSupply.toString() };
    }, [data, isLoading]);

    const balance = data?.[4];
    const isErc20Token = !isLoading && balance != null;

    const token = isErc20Token ? (tokenMeta ?? tokenFallback) : null;

    if (token) {
        token.name = token.name || tokenFallback.name;
        token.symbol = token.symbol || tokenFallback.symbol;
    }

    return { data: token, isLoading, isError };
};
