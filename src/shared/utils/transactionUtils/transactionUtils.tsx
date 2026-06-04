import { encodeFunctionData, type Hex, toHex, zeroHash } from 'viem';
import type { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { ipfsUtils } from '../ipfsUtils';
import { globalExecutorAbi } from './globalExecutorAbi';
import type { ITransactionRequest } from './transactionUtils.api';

class TransactionUtils {
    stringToMetadataHex = (value: string): Hex => {
        const ipfsUri = ipfsUtils.isUri(value)
            ? value
            : ipfsUtils.cidToUri(value)!;

        return toHex(ipfsUri);
    };

    encodeTransactionRequests = (
        transactions: ITransactionRequest[],
        network: Network,
    ): ITransactionRequest =>
        transactions.length === 1
            ? transactions[0]
            : this.buildExecutorTransaction(transactions, network);

    /**
     * Encodes an array of transactions into a single `execute(callId, actions, allowFailureMap)`
     * call targeting the given contract (a DAO or executor). Uses `allowFailureMap = 0` so any
     * sub-action revert reverts the whole batch.
     * @param transactions - Transactions to batch into the execute call.
     * @param target - Address of the contract exposing `execute` (e.g. the DAO itself).
     */
    buildExecuteTransaction = (
        transactions: ITransactionRequest[],
        target: Hex,
    ): ITransactionRequest => {
        const transactionData = encodeFunctionData({
            abi: globalExecutorAbi,
            functionName: 'execute',
            args: [zeroHash, transactions, BigInt(0)],
        });

        return { to: target, data: transactionData, value: BigInt(0) };
    };

    private buildExecutorTransaction = (
        transactions: ITransactionRequest[],
        network: Network,
    ): ITransactionRequest => {
        const { globalExecutor } = networkDefinitions[network].addresses;

        return this.buildExecuteTransaction(transactions, globalExecutor);
    };
}

export const transactionUtils = new TransactionUtils();
