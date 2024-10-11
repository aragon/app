import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, DateFormat, formatterUtils, ProposalStatus } from '@aragon/ods';
import { DateTime } from 'luxon';
import { useState } from 'react';
import type { ISppProposal, ISppStage, ISppSubProposal } from '../../types';
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
    /**
     *  Defines if the vote to approve or veto the proposal.
     */
    isVeto?: boolean;
}

export const SppStageStatus: React.FC<ISppStageStatusProps> = (props) => {
    const { proposal, daoId, subProposal, stage, isVeto } = props;

    const { t } = useTranslations();

    const [isAdvanceDialogOpen, setIsAdvanceDialogOpen] = useState(false);

    const handleAdvanceStage = () => setIsAdvanceDialogOpen(true);

    const stageStatus = sppStageUtils.getStageStatus(proposal, stage);

    const canAdvanceStage = stageStatus === ProposalStatus.ACCEPTED;
    const canVote = stageStatus === ProposalStatus.ACTIVE;

    const maxAdvanceTime = DateTime.fromSeconds(proposal.lastStageTransition + stage.maxAdvance);
    const formattedMaxAdvance = formatterUtils.formatDate(maxAdvanceTime, { format: DateFormat.DURATION });

    const displayAdvanceTime = maxAdvanceTime.diffNow().days < 90;

    if (!canAdvanceStage && !canVote) {
        return null;
    }

    // Only render the plugin-specific vote button when stage cannot be advanced yet and user can vote
    if (canVote && !canAdvanceStage) {
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

    return (
        <div className="mt-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <Button variant="primary" size="md" onClick={handleAdvanceStage}>
                {t('app.plugins.spp.sppStageStatus.button.advance')}
            </Button>
            {displayAdvanceTime && (
                <div className="flex flex-row justify-center gap-0.5">
                    <span className="text-neutral-800">{formattedMaxAdvance}</span>
                    <span className="text-neutral-500">{t('app.plugins.spp.sppStageStatus.advanceInfo')}</span>
                </div>
            )}
            <AdvanceStageDialog open={isAdvanceDialogOpen} onOpenChange={setIsAdvanceDialogOpen} proposal={proposal} />
        </div>
    );
};
