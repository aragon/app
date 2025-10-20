import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { erc20Abi, type Hex } from 'viem';
import { useReadContract } from 'wagmi';
import type { ITokenPluginSettingsToken } from '../../types';

export interface IUseWrappedTokenBalanceParams {
    /**
     * Address of the user to check balance for.
     */
    userAddress?: string;
    /**
     * Governance token configuration.
     */
    token: ITokenPluginSettingsToken;
}

export interface IUseWrappedTokenBalanceReturn {
    /**
     * Wrapped token balance in wei (bigint format).
     * Returns BigInt(0) if the balance is undefined or not yet loaded.
     */
    balance: bigint;
    /**
     * Function to manually refetch the wrapped token balance from the blockchain.
     * Useful for refreshing the balance after wrap/unwrap transactions.
     */
    refetch: () => void;
}

export const useWrappedTokenBalance = (params: IUseWrappedTokenBalanceParams): IUseWrappedTokenBalanceReturn => {
    const { userAddress, token } = params;

    const { id: chainId } = networkDefinitions[token.network];

    const { data: balance, refetch } = useReadContract({
        abi: erc20Abi,
        functionName: 'balanceOf',
        address: token.address as Hex,
        args: [userAddress as Hex],
        query: { enabled: userAddress != null },
        chainId,
    });

    return {
        balance: balance ?? BigInt(0),
        refetch,
    };
};
