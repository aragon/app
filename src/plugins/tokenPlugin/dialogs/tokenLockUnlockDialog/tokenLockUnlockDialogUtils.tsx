import { encodeFunctionData, type Hex } from 'viem';

const lockAbi = [
    {
        type: 'function',
        name: 'createLock',
        inputs: [{ name: 'value', type: 'uint256' }],
        outputs: [],
    },
];

const unlockAbi = [
    {
        type: 'function',
        name: 'beginWithdrawal',
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        outputs: [],
    },
];

const withdrawAbi = [
    {
        type: 'function',
        name: 'withdraw',
        inputs: [{ name: '_tokenId', type: 'uint256' }],
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

    buildUnlockTransaction = (tokenId: bigint, escrowContract: string) => {
        const transactionData = encodeFunctionData({
            abi: unlockAbi,
            functionName: 'beginWithdrawal',
            args: [tokenId],
        });
        const transaction = { to: escrowContract as Hex, data: transactionData, value: BigInt(0) };

        return Promise.resolve(transaction);
    };

    buildWithdrawTransaction = (tokenId: bigint, escrowContract: string) => {
        const transactionData = encodeFunctionData({
            abi: withdrawAbi,
            functionName: 'withdraw',
            args: [tokenId],
        });
        const transaction = { to: escrowContract as Hex, data: transactionData, value: BigInt(0) };

        return Promise.resolve(transaction);
    };
}

export const tokenLockUnlockDialogUtils = new TokenLockUnlockDialogUtils();
