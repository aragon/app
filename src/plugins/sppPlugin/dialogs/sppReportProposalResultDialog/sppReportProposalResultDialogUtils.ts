import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import { encodeFunctionData, type Hex } from 'viem';
import type { ISppProposal, SppProposalType } from '../../types';
import { sppReportProposalResultAbi } from './sppReportProposalResultAbi';

export interface IBuildTransactionParams {
    /**
     * Proposal to submit the vote for.
     */
    proposal: ISppProposal;
    /**
     * The result type being reported (`Approval` or `Veto`)
     */
    resultType: SppProposalType;
}

class SppReportProposalResultDialogUtils {
    buildTransaction = (params: IBuildTransactionParams): Promise<ITransactionRequest> => {
        const { proposal, resultType } = params;

        const transactionData = encodeFunctionData({
            abi: sppReportProposalResultAbi,
            functionName: 'reportProposalResult',
            args: [proposal.proposalIndex, proposal.stageIndex, resultType, false],
        });
        const transaction = { to: proposal.pluginAddress as Hex, data: transactionData, value: BigInt(0) };

        return Promise.resolve(transaction);
    };
}

export const sppReportProposalResultDialogUtils = new SppReportProposalResultDialogUtils();
