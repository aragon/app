import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import { encodeFunctionData, erc20Abi, type Hex } from 'viem';
import type { IBuildApproveTransactionParams } from './tokenApproveTokensDialogUtils.api';

class TokenApproveTokensDialogUtils {
    buildApproveTransaction = (params: IBuildApproveTransactionParams): Promise<ITransactionRequest> => {
        const { token, amount, spender } = params;

        const transactionData = encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [spender, amount],
        });

        const transaction = { to: token.underlying as Hex, data: transactionData, value: BigInt(0) };

        return Promise.resolve(transaction);
    };
}

export const tokenApproveTokensDialogUtils = new TokenApproveTokensDialogUtils();
