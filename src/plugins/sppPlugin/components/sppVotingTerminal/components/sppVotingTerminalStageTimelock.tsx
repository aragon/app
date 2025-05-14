import { type ISppProposal, type ISppStage } from '@/plugins/sppPlugin/types';
import { sppStageUtils } from '@/plugins/sppPlugin/utils/sppStageUtils';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDynamicValue } from '@/shared/hooks/useDynamicValue';
import { CardEmptyState, DateFormat, formatterUtils } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';

export interface ISppVotingTerminalStageTimelockProps {
    /**
     * Timelock stage to display the info for.
     */
    stage: ISppStage;
    /**
     * Parent Proposal of the stage.
     */
    proposal: ISppProposal;
}

const getTimelockState = (proposal: ISppProposal, stage: ISppStage) => {
    const { stageIndex } = stage;
    const { stageIndex: currentStageIndex } = proposal;

    const now = DateTime.now();
    const minAdvance = sppStageUtils.getStageMinAdvance(proposal, stage);

    const isActive = stageIndex === currentStageIndex && minAdvance && now < minAdvance;
    const isComplete = stageIndex < currentStageIndex || (minAdvance && now > minAdvance);

    return isComplete ? 'complete' : isActive ? 'active' : 'pending';
};

export const SppVotingTerminalStageTimelock: React.FC<ISppVotingTerminalStageTimelockProps> = (props) => {
    const { stage, proposal } = props;
    const { t } = useTranslations();

    const initialTimelockState = getTimelockState(proposal, stage);
    const timelockState = useDynamicValue({
        callback: () => getTimelockState(proposal, stage),
        enabled: initialTimelockState === 'active',
    });

    const minAdvance = sppStageUtils.getStageMinAdvance(proposal, stage);
    const date = formatterUtils.formatDate(minAdvance, { format: DateFormat.YEAR_MONTH_DAY_TIME }) ?? '';

    return (
        <CardEmptyState
            heading={t(`app.plugins.spp.sppVotingTerminalStageTimelock.${timelockState}.heading`)}
            description={t(`app.plugins.spp.sppVotingTerminalStageTimelock.${timelockState}.description`, { date })}
            objectIllustration={{ object: 'SETTINGS' }}
            isStacked={false}
            className="border border-neutral-100"
        />
    );
};
