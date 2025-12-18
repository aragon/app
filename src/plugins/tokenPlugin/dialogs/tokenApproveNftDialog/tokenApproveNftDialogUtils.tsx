import { encodeFunctionData, erc721Abi } from 'viem';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import type { IBuildApproveNftTransactionParams } from './tokenApproveNftDialogUtils.api';

class TokenApproveNftDialogUtils {
    buildApproveTransaction = (params: IBuildApproveNftTransactionParams): Promise<ITransactionRequest> => {
        const { tokenAddress, tokenId, spender } = params;

        const transactionData = encodeFunctionData({
            abi: erc721Abi,
            functionName: 'approve',
            args: [spender, tokenId],
        });

        const transaction = { to: tokenAddress, data: transactionData, value: BigInt(0) };

        return Promise.resolve(transaction);
    };
}

export const tokenApproveNftDialogUtils = new TokenApproveNftDialogUtils();
