import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import { encodeFunctionData, type Hex } from 'viem';
import type { IProposal } from '../../../../modules/governance/api/governanceService';
import type { IBuildVoteDataParams } from '../../../../modules/governance/types';
import { reportProposalResultAbi } from './reportProposalResultAbi';

export enum ResultType {
    None = 0,
    Approval = 1,
    Veto = 2,
}

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
    resultType: ResultType;
}

export interface IBuildTransactionParams {
    /**
     * Proposal to submit the vote for.
     */
    proposal: IProposal;
    /**
     * Vote option selected by the user.
     */
    voteValue?: number;
}

class SppReportProposalResultDialogUtils {
    buildReportProposalResultData = (params: IBuildVoteDataParams): Hex => {
        const { proposalIndex } = params;

        const functionArgs = [proposalIndex, false];
        const data = encodeFunctionData({
            abi: reportProposalResultAbi,
            functionName: 'reportProposalResult',
            args: functionArgs,
        });

        return data;
    };

    buildTransaction = (params: IBuildTransactionParams): Promise<ITransactionRequest> => {
        const { proposal, voteValue } = params;

        const buildDataParams: IBuildVoteDataParams = { proposalIndex: proposal.proposalIndex, vote: voteValue };
        const transactionData = this.buildReportProposalResultData(buildDataParams);
        const transaction = { to: proposal.pluginAddress as Hex, data: transactionData, value: BigInt(0) };

        return Promise.resolve(transaction);
    };
}

export const sppReportProposalResultDialogUtils = new SppReportProposalResultDialogUtils();
