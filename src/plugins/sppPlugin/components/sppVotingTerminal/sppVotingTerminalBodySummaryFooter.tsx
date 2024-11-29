import { useTranslations } from '@/shared/components/translationsProvider';
import { type ISppProposal, type ISppStage, SppProposalType } from '../../types';

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
     * is this stage advanced
     */
    isAdvanced: boolean;
}

export const SppVotingTerminalBodySummaryFooter: React.FC<ISppVotingTerminalBodySummaryFooterProps> = (props) => {
    const { stage } = props;

    const { t } = useTranslations();

    const isVetoStage = stage.plugins[0].proposalType === SppProposalType.VETO;
    const actionType = isVetoStage ? 'veto' : 'approve';
    const threshold = isVetoStage ? stage.vetoThreshold : stage.approvalThreshold;
    const entityType = threshold > 1 ? 'bodies' : 'body';

    // TODO: Add new SPP STAGE STATUS component to handle advancing and all other footer logic

    return (
        <>
            <p className="text-center text-neutral-500 md:text-right">
                <span className="text-neutral-800">
                    {t('app.plugins.spp.sppVotingTerminalStage.footer.thresholdLabel', {
                        count: threshold,
                        entityType,
                    })}
                </span>{' '}
                {t('app.plugins.spp.sppVotingTerminalStage.footer.actionRequired', { action: actionType })}
            </p>
        </>
    );
};
