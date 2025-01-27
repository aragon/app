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

const useTimelockStatus = (stage: ISppStage, proposal: ISppProposal) => {
    const stageMinAdvance = sppStageUtils.getStageMinAdvance(proposal, stage)!;
    const now = DateTime.now();

    const didEnd = stage.stageIndex < proposal.stageIndex || now > stageMinAdvance;
    const isActive = stage.stageIndex === proposal.stageIndex && now < stageMinAdvance;

    return { didEnd, isActive, stageMinAdvance };
};

const getTimelockInfo = (didEnd: boolean, isActive: boolean) => {
    if (isActive) {
        return {
            heading: 'app.plugins.spp.sppVotingTerminalStageTimelock.active.heading',
            description: 'app.plugins.spp.sppVotingTerminalStageTimelock.active.description',
        };
    }

    if (didEnd) {
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

    const { didEnd, isActive, stageMinAdvance } = useTimelockStatus(stage, proposal);

    const timelockInfo = useDynamicValue({
        callback: () => getTimelockInfo(didEnd, isActive),
        enabled: isActive,
    });

    const { heading, description } = timelockInfo;

    const date = formatterUtils.formatDate(stageMinAdvance, { format: DateFormat.YEAR_MONTH_DAY_TIME }) ?? '';

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
