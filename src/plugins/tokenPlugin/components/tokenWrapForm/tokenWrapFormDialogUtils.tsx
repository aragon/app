import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import { encodeFunctionData, erc20Abi, type Hex } from 'viem';
import type { IBuildApproveTransactionParams, IBuildTokenWrapTransactionParams } from './tokenWrapFormDialogUtils.api';

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

    buildWrapTransaction = (params: IBuildTokenWrapTransactionParams): Promise<ITransactionRequest> => {
        const { token, address, amount } = params;

        const transactionData = encodeFunctionData({
            abi: erc20WrapperAbi,
            functionName: 'depositFor',
            args: [address, amount],
        });

        const transaction = { to: token.address as Hex, data: transactionData, value: BigInt(0) };

        return Promise.resolve(transaction);
    };

    buildUnwrapTransaction = (params: IBuildTokenWrapTransactionParams): Promise<ITransactionRequest> => {
        const { token, address, amount } = params;

        const transactionData = encodeFunctionData({
            abi: erc20WrapperAbi,
            functionName: 'withdrawTo',
            args: [address, amount],
        });

        const transaction = { to: token.address as Hex, data: transactionData, value: BigInt(0) };

        return Promise.resolve(transaction);
    };
}

export const tokenWrapFormDialogUtils = new TokenWrapFormDialogUtils();
