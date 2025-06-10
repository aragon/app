import { useQueryClient } from '@tanstack/react-query';
import { erc20Abi, type Hex } from 'viem';
import { useBalance, useReadContract } from 'wagmi';

export interface IUseCheckAllowanceProps {
    /**
     * The address of the holder of the tokens.
     */
    owner: Hex;
    /**
     * The address being approved to spend the tokens.
     */
    spender: Hex;
    /**
     * The address of the token contract.
     */
    tokenAddress: Hex;
    /**
     * The chain ID where the token is deployed.
     */
    chainId: number;
    /**
     * Flag to indicate if the query should be enabled.
     */
    enabled?: boolean;
}

export const useCheckAllowance = (props: IUseCheckAllowanceProps) => {
    const { owner, spender, tokenAddress, chainId, enabled } = props;

    const queryClient = useQueryClient();

    const { data: allowance, queryKey: allowanceQueryKey } = useReadContract({
        abi: erc20Abi,
        functionName: 'allowance',
        address: tokenAddress,
        args: [owner, spender],
        query: { enabled },
        chainId,
    });

    const {
        data: balance,
        queryKey: balanceQueryKey,
        status,
    } = useBalance({ address: owner, token: tokenAddress, chainId });

    const invalidateQueries = () => {
        void queryClient.invalidateQueries({ queryKey: allowanceQueryKey });
        void queryClient.invalidateQueries({ queryKey: balanceQueryKey });
    };

    return { allowance, balance, status, invalidateQueries };
};
