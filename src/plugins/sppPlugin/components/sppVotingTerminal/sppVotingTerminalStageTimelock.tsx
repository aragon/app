import { useTranslations } from '@/shared/components/translationsProvider';
import { useDynamicValue } from '@/shared/hooks/useDynamicValue';
import { CardEmptyState, DateFormat, formatterUtils } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import type { ISppProposal, ISppStage } from '../../types';
import { sppStageUtils } from '../../utils/sppStageUtils';

export enum TimelockStatus {
    ACTIVE = 'ACTIVE',
    PENDING = 'PENDING',
    COMPLETE = 'COMPLETE',
}

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

// callback for getting currentStage status in real time when active
export const getTimelockStatus = (stage: ISppStage, proposal: ISppProposal) => {
    const minAdvance = sppStageUtils.getStageMinAdvance(proposal, stage);

    if (!minAdvance) {
        return { status: TimelockStatus.PENDING, minAdvance: undefined };
    }

    const now = DateTime.now();

    if (stage.stageIndex < proposal.stageIndex || now > minAdvance) {
        return { status: TimelockStatus.COMPLETE, minAdvance };
    }

    if (stage.stageIndex === proposal.stageIndex && now < minAdvance) {
        return { status: TimelockStatus.ACTIVE, minAdvance };
    }

    return { status: TimelockStatus.PENDING, minAdvance };
};

// get proper info for the timelock status to display
export const getTimelockInfo = (status: TimelockStatus) => {
    if (status === TimelockStatus.ACTIVE) {
        return {
            heading: 'app.plugins.spp.sppVotingTerminalStageTimelock.active.heading',
            description: 'app.plugins.spp.sppVotingTerminalStageTimelock.active.description',
        };
    }

    if (status === TimelockStatus.COMPLETE) {
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
        enabled: stage.stageIndex === proposal.stageIndex,
    });

    const { status, minAdvance } = timelockStatus;

    const { heading, description } = getTimelockInfo(status);

    const date = minAdvance ? formatterUtils.formatDate(minAdvance, { format: DateFormat.YEAR_MONTH_DAY_TIME }) : '';

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
