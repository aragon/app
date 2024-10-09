import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, DateFormat, formatterUtils } from '@aragon/ods';
import { DateTime } from 'luxon';
import { useState } from 'react';
import type { ISppProposal, ISppStage, ISppSubProposal } from '../../types';
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

    const [isAdvanceDialogOpen, setIsAdvanceDialogOpen] = useState(false);

    const handleAdvanceStage = () => setIsAdvanceDialogOpen(true);

    // TODO: properly set these when SPP statuses are processed (APP-3662)
    const canAdvanceStage = false;
    const canVote = true;

    const maxAdvanceTime = DateTime.fromSeconds(proposal.lastStageTransition + stage.maxAdvance);
    const formattedMaxAdvance = formatterUtils.formatDate(maxAdvanceTime, { format: DateFormat.DURATION });

    if (!canAdvanceStage && !canVote) {
        return null;
    }

    if (canVote && !canAdvanceStage) {
        return (
            <PluginSingleComponent
                slotId={GovernanceSlotId.GOVERNANCE_SUBMIT_VOTE}
                pluginId={subProposal.pluginSubdomain}
                proposal={subProposal}
                daoId={daoId}
            />
        );
    }

    return (
        <div className="mt-4 flex flex-col gap-3 md:self-start">
            <Button variant="primary" size="md" onClick={handleAdvanceStage}>
                {t('app.plugins.spp.sppStageStatus.button.advance')}
            </Button>
            <div className="flex flex-row justify-center gap-0.5">
                <span className="text-neutral-800">{formattedMaxAdvance}</span>
                <span className="text-neutral-500">{t('app.plugins.spp.sppStageStatus.advanceInfo')}</span>
            </div>
            <AdvanceStageDialog open={isAdvanceDialogOpen} onOpenChange={setIsAdvanceDialogOpen} proposal={proposal} />
        </div>
    );
};
