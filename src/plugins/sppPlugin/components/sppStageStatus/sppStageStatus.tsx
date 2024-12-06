import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    Button,
    ChainEntityType,
    DateFormat,
    formatterUtils,
    IconType,
    ProposalVotingStatus,
    Rerender,
    useBlockExplorer,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';
import type { ISppProposal, ISppStage } from '../../types';
import { sppStageUtils } from '../../utils/sppStageUtils';
import { AdvanceStageDialog } from '../advanceStageDialog';

export interface ISppStageStatusProps {
    /**
     * SPP main proposal.
     */
    proposal: ISppProposal;
    /**
     * Stage to display the status for.
     */
    stage: ISppStage;
}

export const SppStageStatus: React.FC<ISppStageStatusProps> = (props) => {
    const { proposal, stage } = props;

    const { t } = useTranslations();

    const { chainId } = networkDefinitions[proposal.network];
    const { buildEntityUrl } = useBlockExplorer({ chainId });

    const [isAdvanceDialogOpen, setIsAdvanceDialogOpen] = useState(false);

    const handleAdvanceStage = () => setIsAdvanceDialogOpen(true);

    const stageStatus = sppStageUtils.getStageStatus(proposal, stage);

    const isStageAdvanced = stage.stageIndex < proposal.stageIndex || proposal.executed.status;

    const execution = proposal.stageExecutions.find((execution) => execution.stageIndex === stage.stageIndex);

    const transactionHash = execution?.transactionHash;

    const advanceTransactionHref = buildEntityUrl({
        type: ChainEntityType.TRANSACTION,
        id: transactionHash,
    });

    const isLastStage = stage.stageIndex === proposal.settings.stages.length - 1;
    const isSignalingProposal = proposal.actions.length === 0;

    // Hide the "advance" button when this is the last stage of a signaling proposal because the advance-stage on the
    // last stage executes the proposal actions and the proposal would get an EXECUTED status instead of ACCEPTED.
    const displayAdvanceStatus = stageStatus === ProposalVotingStatus.ACCEPTED && !(isSignalingProposal && isLastStage);

    const stageAdvanceExpired = stageStatus === ProposalVotingStatus.EXPIRED;
    if (stageAdvanceExpired) {
        return (
            <span className="text-right text-neutral-500">{t('app.plugins.spp.sppStageStatus.advanceExpired')}</span>
        );
    }

    const maxAdvanceTime = sppStageUtils.getStageMaxAdvance(proposal, stage);
    const displayAdvanceTime = maxAdvanceTime && maxAdvanceTime.diffNow('days').days < 90 && !isStageAdvanced;

    if (!displayAdvanceStatus) {
        return null;
    }

    const { label: buttonLabel, ...buttonProps } = isStageAdvanced
        ? {
              label: 'advanced',
              href: advanceTransactionHref,
              target: '_blank',
              variant: 'secondary' as const,
              iconRight: IconType.LINK_EXTERNAL,
          }
        : { label: 'advance', onClick: handleAdvanceStage, variant: 'primary' as const };

    return (
        <div className="mt-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <Button size="md" {...buttonProps}>
                {t(`app.plugins.spp.sppStageStatus.button.${buttonLabel}`)}
            </Button>
            {displayAdvanceTime && (
                <div className="flex flex-row justify-center gap-1">
                    <Rerender>
                        {() => (
                            <span className="text-neutral-800">
                                {formatterUtils.formatDate(maxAdvanceTime, { format: DateFormat.DURATION })}
                            </span>
                        )}
                    </Rerender>
                    <span className="text-neutral-500">{t('app.plugins.spp.sppStageStatus.advanceInfo')}</span>
                </div>
            )}
            <AdvanceStageDialog open={isAdvanceDialogOpen} onOpenChange={setIsAdvanceDialogOpen} proposal={proposal} />
        </div>
    );
};
