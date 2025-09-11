import type { IToken } from '@/modules/finance/api/financeService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useQueryClient } from '@tanstack/react-query';
import { erc20Abi, type Hex } from 'viem';
import { useAccount, useBalance, useReadContract } from 'wagmi';

export interface IUseCheckTokenAllowanceParams {
    /**
     * Address being approved to spend the tokens.
     */
    spender: string;
    /**
     * Token to check the allowance for.
     */
    token: IToken;
}

export const useCheckTokenAllowance = (props: IUseCheckTokenAllowanceParams) => {
    const { spender, token } = props;

    const queryClient = useQueryClient();
    const { address } = useAccount();

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
        data: balance,
        queryKey: balanceQueryKey,
        status,
        isLoading: isBalanceLoading,
    } = useBalance({ address, token: token.address as Hex, chainId });

    const invalidateQueries = () => {
        void queryClient.invalidateQueries({ queryKey: allowanceQueryKey });
        void queryClient.invalidateQueries({ queryKey: balanceQueryKey });
    };

    const isLoading = isAllowanceLoading || isBalanceLoading;

    return { allowance, balance, status, isLoading, invalidateQueries };
};
