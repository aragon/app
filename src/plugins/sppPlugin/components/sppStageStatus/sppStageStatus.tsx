import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, DateFormat, formatterUtils } from '@aragon/ods';
import { useState } from 'react';
import type { ISppProposal, ISppStage } from '../../types';
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

    const [isAdvanceDialogOpen, setIsAdvanceDialogOpen] = useState(false);

    const handleAdvanceStage = () => setIsAdvanceDialogOpen(true);

    // TODO: properly set this when SPP statuses are processed (APP-3662)
    const canAdvanceStage = true;

    const maxAdvanceTime = (proposal.lastStageTransition + stage.maxAdvance) * 1000;
    const formattedMaxAdvance = formatterUtils.formatDate(maxAdvanceTime, { format: DateFormat.DURATION });

    if (!canAdvanceStage) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3">
            <Button variant="primary" size="md" onClick={handleAdvanceStage}>
                {t('app.plugins.spp.sppStageStatus.advance')}
            </Button>
            <div className="flex flex-row gap-0.5">
                <span className="text-neutral-800">{formattedMaxAdvance}</span>
                <span className="text-neutral-500">{t('app.plugins.spp.sppStageStatus.info')}</span>
            </div>
            <AdvanceStageDialog open={isAdvanceDialogOpen} onOpenChange={setIsAdvanceDialogOpen} proposal={proposal} />
        </div>
    );
};
