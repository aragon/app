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
import { type ISppProposal, type ISppStage, type ISppSubProposal } from '../../types';
import { sppStageUtils } from '../../utils/sppStageUtils';
import { AdvanceStageDialog } from '../advanceStageDialog';

export interface ISppStageStatusProps {
    /**
     * ID of the related DAO.
     */
    daoId: string;
    /**
     * SPP main proposal.
     */
    proposal: ISppProposal;
    /**
     * Sub proposal to display the vote status for.
     */
    subProposal?: ISppSubProposal;
    /**
     * Stage to display the status for.
     */
    stage: ISppStage;
}

export const SppStageStatus: React.FC<ISppStageStatusProps> = (props) => {
    const { proposal, subProposal, stage } = props;

    const { t } = useTranslations();

    const { chainId } = networkDefinitions[proposal.network];
    const { buildEntityUrl } = useBlockExplorer({ chainId });

    const [isAdvanceDialogOpen, setIsAdvanceDialogOpen] = useState(false);

    const handleAdvanceStage = () => setIsAdvanceDialogOpen(true);

    const stageStatus = sppStageUtils.getStageStatus(proposal, stage);

    const stageStartDate = sppStageUtils.getStageStartDate(proposal, stage);

    // Fallback to main-proposal execution transaction hash and status for last-stage sub proposals
    const isStageAdvanced = subProposal?.executed.status ?? proposal.executed.status;
    const transactionHash = subProposal?.executed.transactionHash ?? proposal.executed.transactionHash;

    // Hide the "advance" button when this is the last stage of a signaling proposal because the advance-stage on the
    // last stage executes the proposal actions and the proposal would get an EXECUTED status instead of ACCEPTED.
    const displayAdvance =
        (stageStatus === ProposalVotingStatus.ACTIVE || stageStatus === ProposalVotingStatus.ACCEPTED) &&
        sppStageUtils.isApprovalReached(proposal, stage);

    const stageAdvanceExpired = stageStatus === ProposalVotingStatus.EXPIRED;

    const advanceTransactionHref = buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: transactionHash });

    const maxAdvanceTime = sppStageUtils.getStageMaxAdvance(proposal, stage);
    const displayMaxAdvanceTime = maxAdvanceTime && maxAdvanceTime.diffNow('days').days < 90 && !isStageAdvanced;

    const minAdvanceTime = stageStartDate?.plus({ seconds: stage.minAdvance });
    const displayMinAdvanceTime =
        stageStartDate && minAdvanceTime && DateTime.now() < minAdvanceTime && !isStageAdvanced;

    if (stageAdvanceExpired) {
        return (
            <span className="text-right text-neutral-500">{t('app.plugins.spp.sppStageStatus.advanceExpired')}</span>
        );
    }

    if (!displayAdvance) {
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
        : {
              label: 'advance',
              onClick: handleAdvanceStage,
              variant: 'primary' as const,
              disabled: displayMinAdvanceTime,
          };

    const displayAdvanceTime = displayMinAdvanceTime
        ? {
              time: minAdvanceTime,
              info: t('app.plugins.spp.sppStageStatus.minAdvanceInfo'),
          }
        : displayMaxAdvanceTime
          ? {
                time: maxAdvanceTime,
                info: t('app.plugins.spp.sppStageStatus.maxAdvanceInfo'),
            }
          : null;

    return (
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <Button size="md" {...buttonProps}>
                {t(`app.plugins.spp.sppStageStatus.button.${buttonLabel}`)}
            </Button>

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
