import { encodeFunctionData, type Hex } from 'viem';
import type { ISppProposal } from '../../types';

const advanceStageAbi = [
    {
        type: 'function',
        name: 'advanceProposal',
        inputs: [{ name: '_proposalId', type: 'uint256', internalType: 'uint256' }],
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

        const transaction = { to: proposal.pluginAddress as Hex, data: transactionData };

        return Promise.resolve(transaction);
    };
}

export const advanceStageDialogUtils = new AdvanceStageDialogUtils();
