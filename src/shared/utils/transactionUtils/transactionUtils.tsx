import { type Hex, toHex } from 'viem';

class TransactionUtils {
    cidToHex = (cid: string): Hex => toHex(`ipfs://${cid}`);
}

export const transactionUtils = new TransactionUtils();
