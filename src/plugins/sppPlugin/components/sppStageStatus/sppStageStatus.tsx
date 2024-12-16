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
import { useDynamicValue } from '@/shared/hooks/useDynamicValue';

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
    const advanceTransactionHref = buildEntityUrl({
        type: ChainEntityType.TRANSACTION,
        id: execution?.transactionHash,
    });

    const isLastStage = stage.stageIndex === proposal.settings.stages.length - 1;
    const isSignalingProposal = proposal.actions.length === 0;

    const currentTime = useDynamicValue<DateTime>({
        callback: () => DateTime.now(),
    });

    // Only display the advance button if stage has been accepted or non veto stage is still active but approval has already
    // been reached (to display min-advance time). Hide the button/info for the last stage when proposal is signaling
    // to hide executable info text.
    const displayAdvanceButton =
        (stageStatus === ProposalVotingStatus.ACCEPTED ||
            (stageStatus === ProposalVotingStatus.ACTIVE &&
                sppStageUtils.isApprovalReached(proposal, stage) &&
                !sppStageUtils.isVeto(stage))) &&
        !(isSignalingProposal && isLastStage);

    const maxAdvanceTime = sppStageUtils.getStageMaxAdvance(proposal, stage);
    const displayMaxAdvanceTime =
        maxAdvanceTime != null && maxAdvanceTime.diff(currentTime, 'days').days < 90 && !isStageAdvanced;

    const minAdvanceTime = sppStageUtils.getStageMinAdvance(proposal, stage);
    // Due to the delay in the dynamic value hook, the remaining time can be negative, and the counter will count up until 1 second.
    // Adding the remaining time check to avoid displaying the counter when it is negative.
    const remainingTime = minAdvanceTime ? minAdvanceTime.diff(currentTime).milliseconds : 0;
    const displayMinAdvanceTime = minAdvanceTime != null && remainingTime > 0;

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

    const advanceTimeContext = isLastStage ? 'Execute' : 'Advance';
    const advanceTimeInfo = displayMinAdvanceTime
        ? { time: minAdvanceTime, info: t(`app.plugins.spp.sppStageStatus.min${advanceTimeContext}Info`) }
        : { time: maxAdvanceTime, info: t(`app.plugins.spp.sppStageStatus.max${advanceTimeContext}Info`) };

    // Stage cannot be advanced anymore, display expired info text.
    if (stageStatus === ProposalVotingStatus.EXPIRED) {
        return (
            <span className="text-right text-neutral-500">
                {t(`app.plugins.spp.sppStageStatus.expired${advanceTimeContext}`)}
            </span>
        );
    }

    if (!displayAdvanceButton) {
        return null;
    }

    return (
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            {!isLastStage && (
                <Button size="md" {...buttonProps}>
                    {t(`app.plugins.spp.sppStageStatus.button.${buttonLabel}`)}
                </Button>
            )}

            {(displayMinAdvanceTime || displayMaxAdvanceTime) && (
                <div className="flex flex-row justify-center gap-1">
                    <Rerender>
                        {() => (
                            <span className="text-neutral-800">
                                {formatterUtils.formatDate(advanceTimeInfo.time, { format: DateFormat.DURATION })}
                            </span>
                        )}
                    </Rerender>
                    <span className="text-neutral-500">{advanceTimeInfo.info}</span>
                </div>
            )}

            <AdvanceStageDialog open={isAdvanceDialogOpen} onOpenChange={setIsAdvanceDialogOpen} proposal={proposal} />
        </div>
    );
};
