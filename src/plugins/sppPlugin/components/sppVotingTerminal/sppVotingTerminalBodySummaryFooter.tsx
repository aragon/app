import { sppStageUtils } from '@/plugins/sppPlugin/utils/sppStageUtils';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ProposalVotingStatus } from '@aragon/gov-ui-kit';
import type { ISppProposal, ISppStage } from '../../types';
import { SppStageStatus } from '../sppStageStatus';

export interface ISppVotingTerminalBodySummaryFooterProps {
    /**
     * Parent Proposal of the stage
     */
    proposal: ISppProposal;
    /**
     * Stage of proposal
     */
    stage: ISppStage;
}

export const SppVotingTerminalBodySummaryFooter: React.FC<ISppVotingTerminalBodySummaryFooterProps> = (props) => {
    const { stage, proposal } = props;

    const { t } = useTranslations();

    const isVeto = sppStageUtils.isVeto(stage);
    const actionType = isVeto ? 'veto' : 'approve';
    const threshold = isVeto ? stage.vetoThreshold : stage.approvalThreshold;
    const entityType = threshold > 1 ? 'bodies' : 'body';

    const isApprovalReached = sppStageUtils.isApprovalReached(proposal, stage);

    const stageStatus = sppStageUtils.getStageStatus(proposal, stage);
    const isAccepted = stageStatus === ProposalVotingStatus.ACCEPTED;

    // Display stage status component if approval is reached and it is not an optimistic stage
    // or if it is an optimistic stage that is accepted
    if ((isApprovalReached && !isVeto) || (isVeto && isAccepted)) {
        return <SppStageStatus proposal={proposal} stage={stage} />;
    }

    return (
        <p className="text-center text-neutral-500 md:text-right">
            <span className="text-neutral-800">
                {t('app.plugins.spp.sppVotingTerminalStageBodySummaryFooter.thresholdLabel', {
                    count: threshold,
                    entityType,
                })}
            </span>{' '}
            {t('app.plugins.spp.sppVotingTerminalStageBodySummaryFooter.actionRequired', { action: actionType })}
        </p>
    );
};
