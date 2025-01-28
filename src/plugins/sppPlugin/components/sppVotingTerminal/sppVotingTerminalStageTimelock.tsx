import { useTranslations } from '@/shared/components/translationsProvider';
import { useDynamicValue } from '@/shared/hooks/useDynamicValue';
import { CardEmptyState, DateFormat, formatterUtils } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
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

export interface ITimelockInfo {
    /**
     * Heading of the timelock info.
     */
    heading: string;
    /**
     * Description of the timelock info.
     */
    description: string;
}

type CurrentTimelock = 'isComplete' | 'isActive' | 'isPending';

const timelockInfoMap: Record<CurrentTimelock, ITimelockInfo> = {
    isComplete: {
        heading: 'app.plugins.spp.sppVotingTerminalStageTimelock.complete.heading',
        description: 'app.plugins.spp.sppVotingTerminalStageTimelock.complete.description',
    },
    isActive: {
        heading: 'app.plugins.spp.sppVotingTerminalStageTimelock.active.heading',
        description: 'app.plugins.spp.sppVotingTerminalStageTimelock.active.description',
    },
    isPending: {
        heading: 'app.plugins.spp.sppVotingTerminalStageTimelock.pending.heading',
        description: 'app.plugins.spp.sppVotingTerminalStageTimelock.pending.description',
    },
};

const getTimelockInfo = (
    stageIndex: number,
    currentStageIndex: number,
    minAdvance: DateTime,
): { heading: string; description: string } => {
    const now = DateTime.now();

    if (now > minAdvance || stageIndex < currentStageIndex) {
        return timelockInfoMap.isComplete;
    }

    if (stageIndex === currentStageIndex && now < minAdvance) {
        return timelockInfoMap.isActive;
    }

    return timelockInfoMap.isPending;
};

export const SppVotingTerminalStageTimelock: React.FC<ISppVotingTerminalStageTimelockProps> = ({ stage, proposal }) => {
    const { t } = useTranslations();

    const stageIndex = stage.stageIndex;
    const currentStageIndex = proposal.stageIndex;
    const minAdvance = sppStageUtils.getStageMinAdvance(proposal, stage)!;

    const enableDynamicTimelockStatus = useMemo(() => {
        const now = DateTime.now();

        return stageIndex === currentStageIndex && now < minAdvance;
    }, [stageIndex, currentStageIndex, minAdvance]);

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
