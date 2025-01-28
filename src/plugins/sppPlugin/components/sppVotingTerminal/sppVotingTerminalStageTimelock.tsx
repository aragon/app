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

interface ITimelockInfo {
    /**
     * Heading of the timelock info.
     */
    heading: string;
    /**
     * Description of the timelock info.
     */
    description: string;
}

enum CurrentTimelockState {
    IS_COMPLETE = 'IS_COMPLETE',
    IS_ACTIVE = 'IS_ACTIVE',
    IS_PENDING = 'IS_PENDING',
}

const timelockInfoMap: Record<CurrentTimelockState, ITimelockInfo> = {
    [CurrentTimelockState.IS_COMPLETE]: {
        heading: 'app.plugins.spp.sppVotingTerminalStageTimelock.complete.heading',
        description: 'app.plugins.spp.sppVotingTerminalStageTimelock.complete.description',
    },
    [CurrentTimelockState.IS_ACTIVE]: {
        heading: 'app.plugins.spp.sppVotingTerminalStageTimelock.active.heading',
        description: 'app.plugins.spp.sppVotingTerminalStageTimelock.active.description',
    },
    [CurrentTimelockState.IS_PENDING]: {
        heading: 'app.plugins.spp.sppVotingTerminalStageTimelock.pending.heading',
        description: 'app.plugins.spp.sppVotingTerminalStageTimelock.pending.description',
    },
};

const getTimelockInfo = (stageIndex: number, currentStageIndex: number, minAdvance: DateTime): ITimelockInfo => {
    const now = DateTime.now();

    if (now > minAdvance || stageIndex < currentStageIndex) {
        return timelockInfoMap[CurrentTimelockState.IS_COMPLETE];
    }

    if (stageIndex === currentStageIndex && now < minAdvance) {
        return timelockInfoMap[CurrentTimelockState.IS_ACTIVE];
    }

    return timelockInfoMap[CurrentTimelockState.IS_PENDING];
};

export const SppVotingTerminalStageTimelock: React.FC<ISppVotingTerminalStageTimelockProps> = ({ stage, proposal }) => {
    const { t } = useTranslations();

    const stageIndex = stage.stageIndex;
    const currentStageIndex = proposal.stageIndex;
    const minAdvance = sppStageUtils.getStageMinAdvance(proposal, stage)!;
    const now = DateTime.now();

    const enableDynamicTimelockStatus = stageIndex === currentStageIndex && now < minAdvance;

    const timelockInfo = useDynamicValue({
        callback: () => getTimelockInfo(stageIndex, currentStageIndex, minAdvance),
        enabled: enableDynamicTimelockStatus,
    });

    const date = formatterUtils.formatDate(minAdvance, { format: DateFormat.YEAR_MONTH_DAY_TIME });

    const { heading, description } = timelockInfo;

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
