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
import { DateTime } from 'luxon';
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

    const stageStartDate = sppStageUtils.getStageStartDate(proposal, stage);

    const isStageAdvanced = stage.stageIndex < proposal.stageIndex;

    //TODO: sync with backend to get correct transaction hash for advanced stages
    const advanceTransactionHref = buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: '' });

    const isLastStage = stage.stageIndex === proposal.settings.stages.length - 1;
    const isSignalingProposal = proposal.actions.length === 0;

    // Hide the "advance" button when this is the last stage of a signaling proposal because the advance-stage on the
    // last stage executes the proposal actions and the proposal would get an EXECUTED status instead of ACCEPTED.
    const displayAdvanceButton =
        (stageStatus === ProposalVotingStatus.ACTIVE || stageStatus === ProposalVotingStatus.ACCEPTED) &&
        sppStageUtils.isApprovalReached(proposal, stage) &&
        !isSignalingProposal;

    const stageAdvanceExpired = stageStatus === ProposalVotingStatus.EXPIRED;

    const maxAdvanceTime = sppStageUtils.getStageMaxAdvance(proposal, stage);
    const displayMaxAdvanceTime = maxAdvanceTime && maxAdvanceTime.diffNow('days').days < 90 && !isStageAdvanced;

    const minAdvanceTime = sppStageUtils.getStageMinAdvance(proposal, stage);
    const displayMinAdvanceTime = stageStartDate && minAdvanceTime && DateTime.now() < minAdvanceTime;

    const { label: buttonLabel, ...buttonProps } = isStageAdvanced
        ? {
              label: 'advanced',
              href: advanceTransactionHref,
              target: '_blank',
              variant: 'secondary' as const,
              iconRight: IconType.LINK_EXTERNAL,
          }
        : {
              label: 'advance',
              onClick: handleAdvanceStage,
              variant: 'primary' as const,
              disabled: displayMinAdvanceTime,
          };

    const timeContext = isLastStage ? 'Execute' : 'Advance';

    const displayAdvanceTime =
        displayMinAdvanceTime && !isLastStage
            ? {
                  time: minAdvanceTime,
                  info: t(`app.plugins.spp.sppStageStatus.min${timeContext}Info`),
              }
            : displayMaxAdvanceTime && !isLastStage
              ? {
                    time: maxAdvanceTime,
                    info: t(`app.plugins.spp.sppStageStatus.max${timeContext}Info`),
                }
              : null;

    if (stageAdvanceExpired) {
        return (
            <span className="text-right text-neutral-500">{t('app.plugins.spp.sppStageStatus.advanceExpired')}</span>
        );
    }

    if (!displayAdvanceButton) {
        return null;
    }

    return (
        <div className="flex flex-col items-end justify-between gap-3 md:flex-row md:items-center">
            {!isLastStage && (
                <Button size="md" {...buttonProps}>
                    {t(`app.plugins.spp.sppStageStatus.button.${buttonLabel}`)}
                </Button>
            )}

            {displayAdvanceTime && (
                <div className="flex flex-row justify-center gap-1">
                    <Rerender>
                        {() => (
                            <span className="text-neutral-800">
                                {formatterUtils.formatDate(displayAdvanceTime.time, { format: DateFormat.DURATION })}
                            </span>
                        )}
                    </Rerender>
                    <span className="text-neutral-500">{displayAdvanceTime.info}</span>
                </div>
            )}

            <AdvanceStageDialog open={isAdvanceDialogOpen} onOpenChange={setIsAdvanceDialogOpen} proposal={proposal} />
        </div>
    );
};
