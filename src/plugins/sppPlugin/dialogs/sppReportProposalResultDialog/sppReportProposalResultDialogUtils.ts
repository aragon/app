import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import { encodeFunctionData, type Hex } from 'viem';
import type { ISppProposal, SppProposalType } from '../../types';
import { sppReportProposalResultAbi } from './sppReportProposalResultAbi';

export interface IBuildReportProposalResultDataParams {
    /**
     * The incremental ID of the proposal.
     */
    proposalIndex: string;
    /**
     * Index of the stage to which the proposal is linked.
     */
    stageIndex: number;
    /**
     * The result type being reported (`Approval` or `Veto`)
     */
    resultType: SppProposalType;
}

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
    buildReportProposalResultData = (params: IBuildReportProposalResultDataParams): Hex => {
        const { proposalIndex, stageIndex, resultType } = params;

        const functionArgs = [proposalIndex, stageIndex, resultType, false];
        const data = encodeFunctionData({
            abi: sppReportProposalResultAbi,
            functionName: 'reportProposalResult',
            args: functionArgs,
        });

        return data;
    };

    buildTransaction = (params: IBuildTransactionParams): Promise<ITransactionRequest> => {
        const { proposal, resultType } = params;

        const buildDataParams: IBuildReportProposalResultDataParams = {
            proposalIndex: proposal.proposalIndex,
            stageIndex: proposal.stageIndex,
            resultType,
        };
        const transactionData = this.buildReportProposalResultData(buildDataParams);
        const transaction = { to: proposal.pluginAddress as Hex, data: transactionData, value: BigInt(0) };

        return Promise.resolve(transaction);
    };
}

export const sppReportProposalResultDialogUtils = new SppReportProposalResultDialogUtils();
