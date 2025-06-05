import { proposalStatusUtils } from '@/shared/utils/proposalStatusUtils';
import { ProposalStatus } from '@aragon/gov-ui-kit';
import { type ISppProposal, type ISppStage, SppProposalType } from '../../types';
import { sppStageUtils } from '../sppStageUtils';

interface IGetBodyStatusLabelDataParams {
    /**
     * SPP proposal to check the body status for.
     */
    proposal: ISppProposal;
    /**
     * Address of the body.
     */
    body: string;
    /**
     * Stage on which the body is setup.
     */
    stage: ISppStage;
    /**
     * Flag indicating if the vote is active.
     */
    canVote: boolean;
}

class SppProposalUtils {
    getProposalStatus = (proposal: ISppProposal): ProposalStatus => {
        const { executed, settings, startDate, hasActions } = proposal;
        const { stages } = settings;

        const lastStage = stages[stages.length - 1];

        const isExecuted = executed.status;
        const isVetoed = this.hasAnyStageStatus(proposal, ProposalStatus.VETOED);

        const hasUnreachedStages = this.hasAnyStageStatus(proposal, ProposalStatus.UNREACHED);
        const hasExpiredStages = this.hasAnyStageStatus(proposal, ProposalStatus.EXPIRED);

        // Set end date to 0 to mark SPP proposals as "ended" when one or more stages are unreached
        const endDate = !hasUnreachedStages ? sppStageUtils.getStageEndDate(proposal, lastStage)?.toSeconds() : 0;
        const executionExpiryDate = sppStageUtils.getStageMaxAdvance(proposal, lastStage)?.toSeconds();

        const hasAdvanceableStages = stages.some(
            (stage) => !sppStageUtils.isLastStage(proposal, stage) && sppStageUtils.canStageAdvance(proposal, stage),
        );

        const paramsMet = this.areAllStagesAccepted(proposal);
        const canExecuteEarly = lastStage.minAdvance === 0;

        return proposalStatusUtils.getProposalStatus({
            isExecuted,
            isVetoed,
            startDate,
            endDate,
            executionExpiryDate,
            hasAdvanceableStages,
            hasExpiredStages,
            paramsMet,
            hasActions,
            canExecuteEarly,
        });
    };

    hasAnyStageStatus = (proposal: ISppProposal, status: ProposalStatus): boolean =>
        proposal.settings.stages.some((stage) => sppStageUtils.getStageStatus(proposal, stage) === status);

    getCurrentStage = (proposal: ISppProposal): ISppStage => proposal.settings.stages[proposal.stageIndex];

    areAllStagesAccepted = (proposal: ISppProposal): boolean =>
        proposal.settings.stages.every(
            (stage) => sppStageUtils.getStageStatus(proposal, stage) === ProposalStatus.ACCEPTED,
        );

    getBodyResultStatus = (params: IGetBodyStatusLabelDataParams) => {
        const { proposal, body, stage, canVote } = params;
        const { resultType } = sppStageUtils.getBodyResult(proposal, body, stage.stageIndex) ?? {};

        const voted = resultType != null;
        const isVeto = sppStageUtils.isVeto(stage);

        const status = voted ? (resultType === SppProposalType.VETO ? 'failure' : 'success') : 'neutral';

        const labelContext = voted ? 'voted' : canVote ? 'vote' : 'expired';
        const labelSuffix = `${labelContext}.${isVeto ? 'veto' : 'approve'}`;

        const label = `app.plugins.spp.sppVotingTerminalBodyBreakdownDefault.${labelSuffix}`;
        const style =
            status === 'neutral' ? 'text-neutral-500' : status === 'success' ? 'text-success-800' : 'text-critical-800';

        return { status, label, style };
    };
}

export const sppProposalUtils = new SppProposalUtils();
