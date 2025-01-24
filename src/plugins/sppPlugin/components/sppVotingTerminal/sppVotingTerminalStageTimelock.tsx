import { useTranslations } from '@/shared/components/translationsProvider';
import { useDynamicValue } from '@/shared/hooks/useDynamicValue';
import { CardEmptyState, DateFormat, formatterUtils, ProposalVotingStatus } from '@aragon/gov-ui-kit';
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
    /**
     * Status of the stage
     */
    stageStatus: ProposalVotingStatus;
}

const getTimelockInfo = (stage: ISppStage, proposal: ISppProposal, stageStatus: ProposalVotingStatus) => {
    const endDatePassed = DateTime.now() > sppStageUtils.getStageMinAdvance(proposal, stage)!;
    const isTimelockExpired = stageStatus === ProposalVotingStatus.EXPIRED || endDatePassed;
    const isTimelockActive = !isTimelockExpired && stage.stageIndex === proposal.stageIndex;
    const isTimelockComplete = isTimelockExpired || stage.stageIndex < proposal.stageIndex;

    const timelockEndsDate =
        formatterUtils.formatDate(sppStageUtils.getStageMinAdvance(proposal, stage), {
            format: DateFormat.YEAR_MONTH_DAY_TIME,
        }) ?? '';

    if (isTimelockActive) {
        return {
            heading: 'app.plugins.spp.sppVotingTerminalStageTimelock.active.heading',
            description: 'app.plugins.spp.sppVotingTerminalStageTimelock.active.description',
            date: timelockEndsDate,
        };
    }

    if (isTimelockComplete) {
        return {
            heading: 'app.plugins.spp.sppVotingTerminalStageTimelock.complete.heading',
            description: 'app.plugins.spp.sppVotingTerminalStageTimelock.complete.description',
            date: timelockEndsDate,
        };
    }

    return {
        heading: 'app.plugins.spp.sppVotingTerminalStageTimelock.pending.heading',
        description: 'app.plugins.spp.sppVotingTerminalStageTimelock.pending.description',
    };
};

export const SppVotingTerminalStageTimelock: React.FC<ISppVotingTerminalStageTimelockProps> = (props) => {
    const { stage, proposal, stageStatus } = props;

    const { t } = useTranslations();

    const timelockInfo = useDynamicValue({
        callback: () => getTimelockInfo(stage, proposal, stageStatus),
    });

    const { heading, description, date } = timelockInfo;

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
