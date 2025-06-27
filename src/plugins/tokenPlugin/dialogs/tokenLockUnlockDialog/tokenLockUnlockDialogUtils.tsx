import { encodeFunctionData, type Hex } from 'viem';

const veAbi = [
    {
        type: 'function',
        name: 'createLock',
        inputs: [{ name: 'value', type: 'uint256' }],
        outputs: [],
    },
    {
        type: 'function',
        name: 'beginWithdrawal',
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        outputs: [],
    },
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
            abi: veAbi,
            functionName: 'createLock',
            args: [amount],
        });
        const transaction = { to: escrowContract as Hex, data: transactionData, value: BigInt(0) };

        return Promise.resolve(transaction);
    };

    buildUnlockTransaction = (tokenId: bigint, escrowContract: string) => {
        const transactionData = encodeFunctionData({
            abi: veAbi,
            functionName: 'beginWithdrawal',
            args: [tokenId],
        });
        const transaction = { to: escrowContract as Hex, data: transactionData, value: BigInt(0) };

        return Promise.resolve(transaction);
    };

    buildWithdrawTransaction = (tokenId: bigint, escrowContract: string) => {
        const transactionData = encodeFunctionData({
            abi: veAbi,
            functionName: 'withdraw',
            args: [tokenId],
        });
        const transaction = { to: escrowContract as Hex, data: transactionData, value: BigInt(0) };

        return Promise.resolve(transaction);
    };
}

export const tokenLockUnlockDialogUtils = new TokenLockUnlockDialogUtils();
