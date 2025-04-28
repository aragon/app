import type { TranslationFunction } from '@/shared/components/translationsProvider';
import { proposalStatusUtils } from '@/shared/utils/proposalStatusUtils';
import { type AvatarIconVariant, IconType, type ProposalStatus, ProposalVotingStatus } from '@aragon/gov-ui-kit';
import { type ISppProposal, type ISppStage, SppProposalType } from '../../types';
import { sppStageUtils } from '../sppStageUtils';

// Just an internal type to help with the mapping external voting result to UI properties.
type LabelState = 'neutral' | 'success' | 'failure';

const statusToStyle: Record<LabelState, { icon?: IconType; variant?: AvatarIconVariant; label: string }> = {
    success: { icon: IconType.CHECKMARK, variant: 'success', label: 'text-success-800' },
    failure: { icon: IconType.CLOSE, variant: 'critical', label: 'text-critical-800' },
    neutral: { label: 'text-neutral-500' },
};

class SppProposalUtils {
    getProposalStatus = (proposal: ISppProposal): ProposalStatus => {
        const { executed, actions, settings, startDate } = proposal;
        const { stages } = settings;

        const lastStage = stages[stages.length - 1];

        const isExecuted = executed.status;
        const isVetoed = this.hasAnyStageStatus(proposal, ProposalVotingStatus.VETOED);

        const hasUnreachedStages = this.hasAnyStageStatus(proposal, ProposalVotingStatus.UNREACHED);
        const hasExpiredStages = this.hasAnyStageStatus(proposal, ProposalVotingStatus.EXPIRED);

        // Set end date to 0 to mark SPP proposals as "ended" when one or more stages are unreached
        const endDate = !hasUnreachedStages ? sppStageUtils.getStageEndDate(proposal, lastStage)?.toSeconds() : 0;
        const executionExpiryDate = sppStageUtils.getStageMaxAdvance(proposal, lastStage)?.toSeconds();

        const hasAdvanceableStages = stages.some(
            (stage) => !sppStageUtils.isLastStage(proposal, stage) && sppStageUtils.canStageAdvance(proposal, stage),
        );

        const paramsMet = this.areAllStagesAccepted(proposal);
        const hasActions = actions.length > 0;
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

    hasAnyStageStatus = (proposal: ISppProposal, status: ProposalVotingStatus): boolean =>
        proposal.settings.stages.some((stage) => sppStageUtils.getStageStatus(proposal, stage) === status);

    getCurrentStage = (proposal: ISppProposal): ISppStage => proposal.settings.stages[proposal.stageIndex];

    areAllStagesAccepted = (proposal: ISppProposal): boolean =>
        proposal.settings.stages.every(
            (stage) => sppStageUtils.getStageStatus(proposal, stage) === ProposalVotingStatus.ACCEPTED,
        );

    getBodyStatusLabelData = ({
        proposal,
        externalAddress,
        stage,
        canVote,
        t,
    }: {
        proposal: ISppProposal;
        externalAddress: string;
        stage: ISppStage;
        canVote: boolean;
        t: TranslationFunction;
    }) => {
        const { resultType } = sppStageUtils.getBodyResult(proposal, externalAddress, stage.stageIndex) ?? {};

        const voted = resultType != null;
        const isVeto = sppStageUtils.isVeto(stage);

        const status = voted ? (resultType === SppProposalType.VETO ? 'failure' : 'success') : 'neutral';
        const statusStyle = statusToStyle[status];

        const statusLabelContext = voted ? 'voted' : canVote ? 'vote' : 'expired';
        const statusLabelKeySuffix = `${statusLabelContext}.${isVeto ? 'veto' : 'approve'}`;

        return {
            // currently reused in SppVotingTerminalBodyBreakdownDefault and SppVotingTerminalMultiBodySummaryDefault.
            // If different labels are needed, we can just return the key suffix and let components define labels as needed.
            statusLabel: t(`app.plugins.spp.sppVotingTerminalBodyBreakdownDefault.${statusLabelKeySuffix}`),
            statusStyle,
        };
    };
}

export const sppProposalUtils = new SppProposalUtils();
