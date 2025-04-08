import type { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { encodeFunctionData, type Hex, toHex, zeroHash } from 'viem';
import { globalExecutorAbi } from './globalExecutorAbi';
import type { ITransactionRequest } from './transactionUtils.api';

class TransactionUtils {
    cidToHex = (cid: string): Hex => toHex(`ipfs://${cid}`);

    encodeTransactionRequests = (transactions: ITransactionRequest[], network: Network): ITransactionRequest =>
        transactions.length === 1 ? transactions[0] : this.buildExecutorTransaction(transactions, network);

    private buildExecutorTransaction = (transactions: ITransactionRequest[], network: Network): ITransactionRequest => {
        const { globalExecutor } = networkDefinitions[network].addresses;

        const transactionData = encodeFunctionData({
            abi: globalExecutorAbi,
            functionName: 'execute',
            args: [zeroHash, transactions, BigInt(0)],
        });

        const transaction = { to: globalExecutor, data: transactionData, value: BigInt(0) };

        return transaction;
    };
}

export const transactionUtils = new TransactionUtils();
