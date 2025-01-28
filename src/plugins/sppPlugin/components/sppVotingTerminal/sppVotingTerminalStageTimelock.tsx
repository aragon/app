import { useTranslations } from '@/shared/components/translationsProvider';
import { useDynamicValue } from '@/shared/hooks/useDynamicValue';
import { CardEmptyState, DateFormat, formatterUtils } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import type { ISppProposal, ISppStage } from '../../types';
import { sppStageUtils } from '../../utils/sppStageUtils';

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

const getTimelockStatus = (stage: ISppStage, proposal: ISppProposal) => {
    const minAdvance = sppStageUtils.getStageMinAdvance(proposal, stage)!;
    const now = DateTime.now();

    const hasEnded = stage.stageIndex < proposal.stageIndex || now > minAdvance;
    const isActive = stage.stageIndex === proposal.stageIndex && now < minAdvance;

    return { hasEnded, isActive, minAdvance };
};

const getTimelockInfo = (hasEnded: boolean, isActive: boolean) => {
    if (isActive) {
        return {
            heading: 'app.plugins.spp.sppVotingTerminalStageTimelock.active.heading',
            description: 'app.plugins.spp.sppVotingTerminalStageTimelock.active.description',
        };
    }

    if (hasEnded) {
        return {
            heading: 'app.plugins.spp.sppVotingTerminalStageTimelock.complete.heading',
            description: 'app.plugins.spp.sppVotingTerminalStageTimelock.complete.description',
        };
    }

    return {
        heading: 'app.plugins.spp.sppVotingTerminalStageTimelock.pending.heading',
        description: 'app.plugins.spp.sppVotingTerminalStageTimelock.pending.description',
    };
};

export const SppVotingTerminalStageTimelock: React.FC<ISppVotingTerminalStageTimelockProps> = (props) => {
    const { stage, proposal } = props;
    const { t } = useTranslations();

    const timelockStatus = useDynamicValue({
        callback: () => getTimelockStatus(stage, proposal),
    });

    const { hasEnded, isActive, minAdvance } = timelockStatus;

    const { heading, description } = getTimelockInfo(hasEnded, isActive);

    const date = formatterUtils.formatDate(minAdvance, { format: DateFormat.YEAR_MONTH_DAY_TIME }) ?? '';

    return (
        <CardEmptyState
            heading={t(heading)}
            description={t(description, { date })}
            objectIllustration={{ object: 'SETTINGS' }}
            isStacked={false}
            className="border border-neutral-100"
        />
    );
};
