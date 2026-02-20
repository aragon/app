import { useQueryClient } from '@tanstack/react-query';
import { erc20Abi, type Hex } from 'viem';
import { useConnection, useReadContract } from 'wagmi';
import type { IToken } from '@/modules/finance/api/financeService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';

export interface IUseTokenCheckTokenAllowanceParams {
    /**
     * Address being approved to spend the tokens.
     */
    spender: string;
    /**
     * Token to check the allowance for.
     */
    token: IToken;
}

export const useTokenCheckTokenAllowance = (
    props: IUseTokenCheckTokenAllowanceParams,
) => {
    const { spender, token } = props;

    const queryClient = useQueryClient();
    const { address } = useConnection();

    const { id: chainId } = networkDefinitions[token.network];

    const {
        data: allowance,
        queryKey: allowanceQueryKey,
        isLoading: isAllowanceLoading,
    } = useReadContract({
        abi: erc20Abi,
        functionName: 'allowance',
        address: token.address as Hex,
        args: [address as Hex, spender as Hex],
        query: { enabled: address != null },
        chainId,
    });

    const {
        data: balanceOf,
        queryKey: balanceQueryKey,
        status,
        isLoading: isBalanceLoading,
    } = useReadContract({
        abi: erc20Abi,
        functionName: 'balanceOf',
        address: token.address as Hex,
        args: [address as Hex],
        query: { enabled: address != null },
        chainId,
    });

    const balance =
        balanceOf != null
            ? {
                  decimals: token.decimals,
                  symbol: token.symbol,
                  value: balanceOf,
              }
            : undefined;

    const invalidateQueries = () => {
        void queryClient.invalidateQueries({ queryKey: allowanceQueryKey });
        void queryClient.invalidateQueries({ queryKey: balanceQueryKey });
    };

    const isLoading = isAllowanceLoading || isBalanceLoading;

    return { allowance, balance, status, isLoading, invalidateQueries };
};
