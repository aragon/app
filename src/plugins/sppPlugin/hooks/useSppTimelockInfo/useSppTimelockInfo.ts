import { useTranslations } from '@/shared/components/translationsProvider';
import { DateFormat, formatterUtils } from '@aragon/gov-ui-kit';
import { type ISppProposal, type ISppStage } from '../../types';
import { sppStageUtils } from '../../utils/sppStageUtils';

export interface IUseSppTimelockInfoParams {
    /**
     * Timelock stage to display the info for.
     */
    stage: ISppStage;
    /**
     * Parent Proposal of the timelock stage.
     */
    proposal: ISppProposal;
}

export interface TimelockInfo {
    /**
     * Heading text to display on the card.
     */
    heading: string;
    /**
     * Description text to display on the card. Showing the end/completed date or other useful information.
     */
    description: string;
}

export const useSppTimelockInfo = (params: IUseSppTimelockInfoParams): TimelockInfo => {
    const { stage, proposal } = params;

    const { t } = useTranslations();

    const isTimelockActive = stage.stageIndex === proposal.stageIndex;
    const isTimelockComplete = stage.stageIndex < proposal.stageIndex;

    const timelockCompletedDate =
        formatterUtils.formatDate(sppStageUtils.getStageEndDate(proposal, stage), {
            format: DateFormat.YEAR_MONTH_DAY_TIME,
        }) ?? '';

    const timelockEndsDate =
        formatterUtils.formatDate(sppStageUtils.getStageMinAdvance(proposal, stage), {
            format: DateFormat.YEAR_MONTH_DAY_TIME,
        }) ?? '';

    const pendingString = 'app.plugins.spp.sppVotingTerminalStageTimelock.pending';
    const activeString = 'app.plugins.spp.sppVotingTerminalStageTimelock.active';
    const completeString = 'app.plugins.spp.sppVotingTerminalStageTimelock.complete';

    if (isTimelockActive) {
        return {
            heading: t(`${activeString}.heading`),
            description: t(`${activeString}.description`, { date: timelockEndsDate }),
        };
    }

    if (isTimelockComplete) {
        return {
            heading: t(`${completeString}.heading`),
            description: t(`${completeString}.description`, { date: timelockCompletedDate }),
        };
    }

    return {
        heading: t(`${pendingString}.heading`),
        description: t(`${pendingString}.description`),
    };
};
