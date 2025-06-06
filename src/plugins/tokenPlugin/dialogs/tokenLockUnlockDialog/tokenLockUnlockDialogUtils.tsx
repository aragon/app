import { encodeFunctionData, type Hex } from 'viem';

const lockAbi = [
    {
        type: 'function',
        name: 'createLock',
        inputs: [{ name: 'value', type: 'uint256' }],
        outputs: [],
    },
];

class TokenLockUnlockDialogUtils {
    buildLockTransaction = (amount: bigint, escrowContract: string) => {
        const transactionData = encodeFunctionData({
            abi: lockAbi,
            functionName: 'createLock',
            args: [amount],
        });
        const transaction = { to: escrowContract as Hex, data: transactionData, value: BigInt(0) };

        return Promise.resolve(transaction);
    };

    buildUnlockTransaction = () => {
        // TODO:: implement unlock
        const transaction = { to: '0x' as Hex, data: '0x' as Hex, value: BigInt(0) };
        return Promise.resolve(transaction);
    };
}

export const tokenLockUnlockDialogUtils = new TokenLockUnlockDialogUtils();
