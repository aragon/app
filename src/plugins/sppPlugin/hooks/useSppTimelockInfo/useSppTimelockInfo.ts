import { useTranslations } from '@/shared/components/translationsProvider';
import { DateFormat, formatterUtils } from '@aragon/gov-ui-kit';
import { type ISppProposal, type ISppStage } from '../../types';
import { sppStageUtils } from '../../utils/sppStageUtils';

export interface IUseSppTimelockInfoParams {
    /**
     * Stage to display the info for.
     */
    stage: ISppStage;
    /**
     * Parent Proposal of the stage
     */
    proposal: ISppProposal;
}

export interface TimelockInfo {
    heading: string;
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

    if (isTimelockActive) {
        const baseString = 'app.plugins.spp.sppVotingTerminalStageTimelock.active';
        return {
            heading: t(`${baseString}.heading`),
            description: t(`${baseString}.description`, { date: timelockEndsDate }),
        };
    }

    if (isTimelockComplete) {
        const baseText = 'app.plugins.spp.sppVotingTerminalStageTimelock.complete';
        return {
            heading: t(`${baseText}.heading`),
            description: t(`${baseText}.description`, { date: timelockCompletedDate }),
        };
    }

    return {
        heading: t('app.plugins.spp.sppVotingTerminalStageTimelock.pending.heading'),
        description: t('app.plugins.spp.sppVotingTerminalStageTimelock.pending.description'),
    };
};
