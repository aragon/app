import { sppProposalUtils } from '@/plugins/sppPlugin/utils/sppProposalUtils';
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

export const getTimelockStatus = (stageIndex: number, currentStageIndex: number, minAdvance: DateTime | undefined) => {
    if (!minAdvance) {
        return TimelockStatus.PENDING;
    }

    const now = DateTime.now();

    if (stageIndex < currentStageIndex || now > minAdvance) {
        return TimelockStatus.COMPLETE;
    }

    if (stageIndex === currentStageIndex && now < minAdvance) {
        return TimelockStatus.ACTIVE;
    }

    return TimelockStatus.PENDING;
};

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

    const currentStageIndex = sppProposalUtils.getCurrentStage(proposal).stageIndex;
    const stageIndex = stage.stageIndex;

    const minAdvance = sppStageUtils.getStageMinAdvance(proposal, stage);

    const enableDynamicTimelockStatus =
        getTimelockStatus(currentStageIndex, stageIndex, minAdvance) === TimelockStatus.ACTIVE;
    const status = useDynamicValue({
        callback: () => getTimelockStatus(currentStageIndex, stageIndex, minAdvance),
        enabled: enableDynamicTimelockStatus,
    });

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
