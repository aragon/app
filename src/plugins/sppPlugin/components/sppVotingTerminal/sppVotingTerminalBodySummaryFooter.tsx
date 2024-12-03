import { useTranslations } from '@/shared/components/translationsProvider';
import { type ISppProposal, type ISppStage, type ISppSubProposal } from '../../types';
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
     * Flag indicating if the vote is a veto.
     */
    isVeto: boolean;
}

export const SppVotingTerminalBodySummaryFooter: React.FC<ISppVotingTerminalBodySummaryFooterProps> = (props) => {
    const { stage, proposal, isActive, isVeto } = props;

    const { t } = useTranslations();

    const actionType = isVeto ? 'veto' : 'approve';
    const threshold = isVeto ? stage.vetoThreshold : stage.approvalThreshold;
    const entityType = threshold > 1 ? 'bodies' : 'body';

    if (!isActive) {
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
