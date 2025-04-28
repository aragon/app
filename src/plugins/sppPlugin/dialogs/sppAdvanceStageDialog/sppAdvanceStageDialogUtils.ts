import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
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

class SppAdvanceStageDialogUtils {
    buildTransaction = (proposal: ISppProposal): Promise<ITransactionRequest> => {
        const functionArgs = [proposal.proposalIndex];
        const transactionData = encodeFunctionData({
            abi: advanceStageAbi,
            functionName: 'advanceProposal',
            args: functionArgs,
        });

        const transaction = { to: proposal.pluginAddress as Hex, data: transactionData, value: BigInt(0) };

        return Promise.resolve(transaction);
    };
}

export const sppAdvanceStageDialogUtils = new SppAdvanceStageDialogUtils();
