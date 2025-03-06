import type { TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import { encodeFunctionData, type Hex } from 'viem';
import type { IBuildTokenWrapTransactionParams } from './tokenWrapFormDialogUtils.abi';

const erc20WrapperAbi = [
    {
        type: 'function',
        name: 'depositFor',
        inputs: [
            { name: 'account', type: 'address' },
            { name: 'value', type: 'uint256' },
        ],
        outputs: [],
    },
    {
        type: 'function',
        name: 'withdrawTo',
        inputs: [
            { name: 'account', type: 'address' },
            { name: 'value', type: 'uint256' },
        ],
        outputs: [],
    },
];

class TokenWrapFormDialogUtils {
    buildWrapTransaction = (params: IBuildTokenWrapTransactionParams) => {
        const { token, address, amount } = params;

        const transactionData = encodeFunctionData({
            abi: erc20WrapperAbi,
            functionName: 'depositFor',
            args: [address, amount],
        });

        const transaction: TransactionDialogPrepareReturn = { to: token.address as Hex, data: transactionData };

        return Promise.resolve(transaction);
    };

    buildUnwrapTransaction = (params: IBuildTokenWrapTransactionParams) => {
        const { token, address, amount } = params;

        const transactionData = encodeFunctionData({
            abi: erc20WrapperAbi,
            functionName: 'withdrawTo',
            args: [address, amount],
        });

        const transaction: TransactionDialogPrepareReturn = { to: token.address as Hex, data: transactionData };

        return Promise.resolve(transaction);
    };
}

export const tokenWrapFormDialogUtils = new TokenWrapFormDialogUtils();
