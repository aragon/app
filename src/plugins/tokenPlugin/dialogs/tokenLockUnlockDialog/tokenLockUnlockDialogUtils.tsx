import { encodeFunctionData, type Hex } from "viem";

const lockAbi = [
    {
        type: 'function',
        name: 'createLock',
        inputs: [
            { name: 'value', type: 'uint256' },
        ],
        outputs: [],
    },
];


class TokenLockUnlockDialogUtils {
  buildLockTransaction = (amount: bigint) => {
          const transactionData = encodeFunctionData({
            abi: lockAbi,
            functionName: 'createLock',
            args: [amount],
        });
    const transaction = { to: '0x' as Hex, data: transactionData, value: BigInt(0) };
    return Promise.resolve(transaction);
  }

  buildUnlockTransaction = () => {
    const transaction = { to: '0x' as Hex, data: '0x' as Hex, value: BigInt(0) };
    return Promise.resolve(transaction);
  }
}

export const tokenLockUnlockDialogUtils = new TokenLockUnlockDialogUtils()
