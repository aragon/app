import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import { encodeFunctionData, erc20Abi, type Hex } from 'viem';
import type { IBuildApproveTransactionParams } from './tokenWrapFormDialogUtils.api';

class TokenApproveTokensDialogUtils {
    buildApproveTransaction = (params: IBuildApproveTransactionParams): Promise<ITransactionRequest> => {
        const { token, amount } = params;

        const transactionData = encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [token.address as Hex, amount],
        });

        const transaction = { to: token.underlying as Hex, data: transactionData, value: BigInt(0) };

        return Promise.resolve(transaction);
    };
}

export const tokenApproveTokensDialogUtils = new TokenApproveTokensDialogUtils();
