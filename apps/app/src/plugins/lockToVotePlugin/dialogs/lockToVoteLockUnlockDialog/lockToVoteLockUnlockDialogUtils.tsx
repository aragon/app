import { encodeFunctionData, type Hex } from 'viem';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';

const lockManagerAbi = [
    {
        type: 'function',
        name: 'lock',
        inputs: [{ name: 'amount', type: 'uint256' }],
        outputs: [],
    },
    { type: 'function', name: 'unlock', inputs: [], outputs: [] },
] as const;

class LockToVoteLockUnlockDialogUtils {
    buildLockTransaction = (
        amount: bigint,
        lockManagerAddress: string,
    ): Promise<ITransactionRequest> => {
        const transactionData = encodeFunctionData({
            abi: lockManagerAbi,
            functionName: 'lock',
            args: [amount],
        });

        const transaction = {
            to: lockManagerAddress as Hex,
            data: transactionData,
            value: BigInt(0),
        };

        return Promise.resolve(transaction);
    };

    buildUnlockTransaction = (
        lockManagerAddress: string,
    ): Promise<ITransactionRequest> => {
        const transactionData = encodeFunctionData({
            abi: lockManagerAbi,
            functionName: 'unlock',
            args: [],
        });

        const transaction = {
            to: lockManagerAddress as Hex,
            data: transactionData,
            value: BigInt(0),
        };

        return Promise.resolve(transaction);
    };
}

export const lockToVoteLockUnlockDialogUtils =
    new LockToVoteLockUnlockDialogUtils();
