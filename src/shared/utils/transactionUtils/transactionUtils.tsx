import type { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { encodeFunctionData, type Hex, multicall3Abi, toHex } from 'viem';
import type { IMulticallRequest, ITransactionRequest, ITransactionToMulticallRequest } from './transactionUtils.api';

class TransactionUtils {
    cidToHex = (cid: string): Hex => toHex(`ipfs://${cid}`);

    encodeTransactionRequests = (transactions: ITransactionRequest[], network: Network): ITransactionRequest => {
        if (transactions.length === 1) {
            return transactions[0];
        }

        const multicallRequests = transactions.map((tx) => this.transactionToMulticallRequest({ transaction: tx }));
        const multicallTransaction = this.encodeMulticallTransaction(multicallRequests, network);

        return multicallTransaction;
    };

    private transactionToMulticallRequest = (params: ITransactionToMulticallRequest): IMulticallRequest => {
        const { transaction, allowFailure = false } = params;
        const { data, to } = transaction;

        return { target: to, callData: data, allowFailure };
    };

    private encodeMulticallTransaction = (calls: IMulticallRequest[], network: Network): ITransactionRequest => {
        const { address: multicall3Address } = networkDefinitions[network].contracts!.multicall3!;
        const transactionData = encodeFunctionData({ abi: multicall3Abi, functionName: 'aggregate3', args: [calls] });
        const transaction = { to: multicall3Address, data: transactionData };

        return transaction;
    };
}

export const transactionUtils = new TransactionUtils();
