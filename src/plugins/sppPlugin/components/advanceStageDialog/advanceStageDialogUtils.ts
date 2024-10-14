import { type TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import { encodeFunctionData, type Hex } from 'viem';
import type { ISppProposal } from '../../types';

const advanceStageAbi = [
    {
        type: 'function',
        inputs: [{ name: '_proposalId', internalType: 'bytes32', type: 'bytes32' }],
        name: 'advanceProposal',
        outputs: [],
        stateMutability: 'nonpayable',
    },
];

class AdvanceStageDialogUtils {
    buildTransaction = (proposal: ISppProposal) => {
        const functionArgs = [proposal.proposalIndex];
        const transactionData = encodeFunctionData({
            abi: advanceStageAbi,
            functionName: 'advanceProposal',
            args: functionArgs,
        });

        const transaction: TransactionDialogPrepareReturn = {
            to: proposal.pluginAddress as Hex,
            data: transactionData,
        };

        return Promise.resolve(transaction);
    };
}

export const advanceStageDialogUtils = new AdvanceStageDialogUtils();
