import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import { encodeFunctionData, type Hex } from 'viem';

const lockManagerAbi = [
    {
        type: 'function',
        name: 'lock',
        inputs: [],
        outputs: [],
    },
    {
        type: 'function',
        name: 'unlock',
        inputs: [],
        outputs: [],
    },
] as const;

class TokenLockUnlockDialogUtils {
    buildLockTransaction = (lockManagerAddress: string): Promise<ITransactionRequest> => {
        const transactionData = encodeFunctionData({
            abi: lockManagerAbi,
            functionName: 'lock',
            args: [],
        });

        const transaction = { to: lockManagerAddress as Hex, data: transactionData, value: BigInt(0) };

        return Promise.resolve(transaction);
    };

    buildUnlockTransaction = (lockManagerAddress: string): Promise<ITransactionRequest> => {
        const transactionData = encodeFunctionData({
            abi: lockManagerAbi,
            functionName: 'unlock',
            args: [],
        });

        const transaction = { to: lockManagerAddress as Hex, data: transactionData, value: BigInt(0) };

        return Promise.resolve(transaction);
    };
}

export const tokenLockUnlockDialogUtils = new TokenLockUnlockDialogUtils();
