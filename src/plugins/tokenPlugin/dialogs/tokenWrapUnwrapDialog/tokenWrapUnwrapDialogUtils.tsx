import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import { encodeFunctionData, type Hex } from 'viem';
import type { IBuildTokenWrapTransactionParams } from './tokenWrapUnwrapDialogUtils.api';

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

class TokenWrapUnwrapDialogUtils {
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

export const tokenWrapUnwrapDialogUtils = new TokenWrapUnwrapDialogUtils();
