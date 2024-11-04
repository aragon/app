import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    Button,
    ChainEntityType,
    DateFormat,
    formatterUtils,
    IconType,
    ProposalVotingStatus,
    useBlockExplorer,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { SppProposalType, type ISppProposal, type ISppStage, type ISppSubProposal } from '../../types';
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
    subProposal: ISppSubProposal;
    /**
     * Stage to display the status for.
     */
    stage: ISppStage;
}

export const SppStageStatus: React.FC<ISppStageStatusProps> = (props) => {
    const { proposal, daoId, subProposal, stage } = props;

    const { t } = useTranslations();

    const { chainId } = networkDefinitions[proposal.network];
    const { buildEntityUrl } = useBlockExplorer({ chainId });

    const [isAdvanceDialogOpen, setIsAdvanceDialogOpen] = useState(false);

    const handleAdvanceStage = () => setIsAdvanceDialogOpen(true);

    const stageStatus = sppStageUtils.getStageStatus(proposal, stage);

    // Fallback to main-proposal execution transaction hash and status for last-stage sub proposals
    const isStageAdvanced = subProposal.executed.status || proposal.executed.status;
    const transactionHash = subProposal.executed.transactionHash ?? proposal.executed.transactionHash;

    const isLastStage = stage.stageIndex === proposal.settings.stages.length - 1;
    const isSignalingProposal = proposal.actions.length === 0;

    // Hide the "advance" button when this is the last stage of a signaling proposal because the advance-stage on the
    // last stage executes the proposal actions and the proposal would get an EXECUTED status instead of ACCEPTED.
    const displayAdvanceStatus = stageStatus === ProposalVotingStatus.ACCEPTED && !(isSignalingProposal && isLastStage);
    const canVote = stageStatus === ProposalVotingStatus.ACTIVE;

    const advanceTransactionHref = buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: transactionHash });

    const maxAdvanceTime = sppStageUtils.getStageMaxAdvance(proposal, stage);
    const formattedMaxAdvance = formatterUtils.formatDate(maxAdvanceTime, { format: DateFormat.DURATION });

    const displayAdvanceTime = maxAdvanceTime && maxAdvanceTime.diffNow('days').days < 90 && !isStageAdvanced;

    if (!displayAdvanceStatus && !canVote) {
        return null;
    }

    const isVeto = stage.plugins[0].proposalType === SppProposalType.VETO;

    if (canVote) {
        const slotId = GovernanceSlotId.GOVERNANCE_SUBMIT_VOTE;
        const { pluginSubdomain: pluginId } = subProposal;

        return (
            <PluginSingleComponent
                slotId={slotId}
                pluginId={pluginId}
                proposal={subProposal}
                daoId={daoId}
                isVeto={isVeto}
            />
        );
    }

    const { label: buttonLabel, ...buttonProps } = isStageAdvanced
        ? {
              label: 'advanced',
              href: advanceTransactionHref,
              target: '_blank',
              variant: 'success' as const,
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
                    <span className="text-neutral-800">{formattedMaxAdvance}</span>
                    <span className="text-neutral-500">{t('app.plugins.spp.sppStageStatus.advanceInfo')}</span>
                </div>
            )}
            <AdvanceStageDialog open={isAdvanceDialogOpen} onOpenChange={setIsAdvanceDialogOpen} proposal={proposal} />
        </div>
    );
};
