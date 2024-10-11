import type { TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import { encodeFunctionData, type Hex } from 'viem';

export interface IBuildTransactionParams {
    /**
     * The incremental id of the proposal
     */
    proposalIndex: string;
    /**
     * Address of the proposal plugin.
     */
    pluginAddress: string;
}

const executeAbi = [
    {
        type: 'function',
        inputs: [{ name: '_proposalId', internalType: 'uint256', type: 'uint256' }],
        name: 'execute',
        outputs: [],
        stateMutability: 'nonpayable',
    },
];

class ExecuteDialogUtils {
    buildTransaction = (params: IBuildTransactionParams) => {
        const { proposalIndex, pluginAddress } = params;

        const data = encodeFunctionData({ abi: executeAbi, functionName: 'execute', args: [proposalIndex] });
        const transaction: TransactionDialogPrepareReturn = { to: pluginAddress as Hex, data: data };

        return transaction;
    };
}

export const executeDialogUtils = new ExecuteDialogUtils();
