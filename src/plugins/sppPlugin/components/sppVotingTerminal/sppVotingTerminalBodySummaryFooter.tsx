import { useTranslations } from '@/shared/components/translationsProvider';
import { type ISppProposal, type ISppStage, type ISppSubProposal, SppProposalType } from '../../types';
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
    /**
     * is this stage active
     */
    isActive: boolean;
    /**
     * Sub proposal to display the vote status for.
     */
    subProposal?: ISppSubProposal;
}

export const SppVotingTerminalBodySummaryFooter: React.FC<ISppVotingTerminalBodySummaryFooterProps> = (props) => {
    const { stage, proposal, isActive, subProposal } = props;

    const { t } = useTranslations();

    const isVetoStage = stage.plugins[0].proposalType === SppProposalType.VETO;
    const actionType = isVetoStage ? 'veto' : 'approve';
    const threshold = isVetoStage ? stage.vetoThreshold : stage.approvalThreshold;
    const entityType = threshold > 1 ? 'bodies' : 'body';

    if (!isActive) {
        return <SppStageStatus proposal={proposal} stage={stage} subProposal={subProposal} />;
    }

    return (
        <>
            <p className="text-center text-neutral-500 md:text-right">
                <span className="text-neutral-800">
                    {t('app.plugins.spp.sppVotingTerminalStageBodySummaryFooter.thresholdLabel', {
                        count: threshold,
                        entityType,
                    })}
                </span>{' '}
                {t('app.plugins.spp.sppVotingTerminalStageBodySummaryFooter.actionRequired', { action: actionType })}
            </p>
        </>
    );
};
