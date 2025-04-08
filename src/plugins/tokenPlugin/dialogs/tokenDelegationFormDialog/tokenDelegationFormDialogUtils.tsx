import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import { encodeFunctionData, type Hex } from 'viem';

const delegateTokensAbi = [
    {
        type: 'function',
        name: 'delegate',
        inputs: [{ name: 'delegatee', type: 'address' }],
        outputs: [],
    },
];

class TokenDelegationFormDialogUtils {
    buildTransaction = (tokenAddress: string, delegatee: string): Promise<ITransactionRequest> => {
        const functionArgs = [delegatee];
        const transactionData = encodeFunctionData({
            abi: delegateTokensAbi,
            functionName: 'delegate',
            args: functionArgs,
        });

        const transaction = { to: tokenAddress as Hex, data: transactionData, value: BigInt(0) };

        return Promise.resolve(transaction);
    };
}

export const tokenDelegationFormDialogUtils = new TokenDelegationFormDialogUtils();
