import { encodeFunctionData, erc20Abi, type Hex } from 'viem';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';

export interface IBuildApproveTransactionParams {
    /**
     * Address of the token to send the approve transaction to.
     */
    token: string;
    /**
     * Amount of tokens to be approved.
     */
    amount: bigint;
    /**
     * Spender address used in the approve function.
     */
    spender: string;
}

class TokenApproveTokensDialogUtils {
    buildApproveTransaction = (
        params: IBuildApproveTransactionParams,
    ): Promise<ITransactionRequest> => {
        const { token, amount, spender } = params;

        const transactionData = encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [spender as Hex, amount],
        });

        const transaction = {
            to: token as Hex,
            data: transactionData,
            value: BigInt(0),
        };

        return Promise.resolve(transaction);
    };
}

export const tokenApproveTokensDialogUtils =
    new TokenApproveTokensDialogUtils();
