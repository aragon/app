import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { Button, ChainEntityType, IconType, ProposalVotingStatus, useBlockExplorer } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { type ISppProposal, type ISppStage, SppProposalType } from '../../types';
import { sppStageUtils } from '../../utils/sppStageUtils';
import { AdvanceStageDialog } from '../advanceStageDialog';

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
    const { proposal, stage, isAdvanced } = props;

    const { t } = useTranslations();

    const { chainId } = networkDefinitions[proposal.network];
    const { buildEntityUrl } = useBlockExplorer({ chainId });
    const advanceTransactionHref = buildEntityUrl({
        type: ChainEntityType.TRANSACTION,
        id: proposal.executed.transactionHash,
    });

    const [isAdvanceDialogOpen, setIsAdvanceDialogOpen] = useState(false);

    const handleAdvanceStage = () => setIsAdvanceDialogOpen(true);

    const isVetoStage = stage.plugins[0].proposalType === SppProposalType.VETO;
    const actionType = isVetoStage ? 'veto' : 'approve';
    const threshold = isVetoStage ? stage.vetoThreshold : stage.approvalThreshold;
    const entityType = threshold > 1 ? 'bodies' : 'body';

    const stageStatus = sppStageUtils.getStageStatus(proposal, stage);

    const canAdvance = sppStageUtils.canAdvanceStage(proposal, stage);

    const stageAccepted = stageStatus === ProposalVotingStatus.ACCEPTED;
    const now = DateTime.now();
    const stageStartDate = sppStageUtils.getStageStartDate(proposal, stage);
    const minAdvanceDate = stageStartDate?.plus({ seconds: stage.minAdvance });

    const stageExpired = stageStatus === ProposalVotingStatus.EXPIRED;
    if (stageExpired) {
        return <p className="text-neutral-500">Proposal not advanced in time</p>;
    }

    if (isAdvanced) {
        return (
            <Button href={advanceTransactionHref} target="_blank" variant="success" iconRight={IconType.LINK_EXTERNAL}>
                Proposal Advanced
            </Button>
        );
    }

    if (canAdvance) {
        return (
            <>
                <Button className="md:w-fit" onClick={handleAdvanceStage} size="md" variant="primary">
                    Advance Proposal
                </Button>
                <AdvanceStageDialog
                    open={isAdvanceDialogOpen}
                    onOpenChange={setIsAdvanceDialogOpen}
                    proposal={proposal}
                />
            </>
        );
    }

    if (stageAccepted && minAdvanceDate && minAdvanceDate > now) {
        const timeUntilAdvancable = minAdvanceDate.diff(now, ['hours', 'minutes', 'seconds']);
        const formattedTime = timeUntilAdvancable.toFormat('hh:mm:ss');

        return (
            <div className="flex flex-col gap-3 md:flex-row md:justify-between">
                <Button disabled={true} className="md:w-fit" onClick={handleAdvanceStage} size="md" variant="primary">
                    Advance Proposal
                </Button>
                <p className="text-neutral-800">
                    {formattedTime}
                    <span className="text-neutral-500"> until advancable</span>
                </p>
            </div>
        );
    }

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
