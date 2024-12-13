import { CardEmptyState, DateFormat, formatterUtils } from '@aragon/gov-ui-kit';
import type { ISppProposal, ISppStage } from '../../types';
import { sppStageUtils } from '../../utils/sppStageUtils';

export interface ISppVotingTerminalStageTimelockProps {
    /**
     * Stage to display the info for.
     */
    stage: ISppStage;
    /**
     * Parent Proposal of the stage
     */
    proposal: ISppProposal;
}

export const SppVotingTerminalStageTimelock: React.FC<ISppVotingTerminalStageTimelockProps> = (props) => {
    const { stage, proposal } = props;

    const isTimelockActive = stage.stageIndex === proposal.stageIndex;
    const isTimelockInTheFuture = stage.stageIndex > proposal.stageIndex;

    const timelockEndedAtText =
        formatterUtils.formatDate(sppStageUtils.getStageEndDate(proposal, stage), {
            format: DateFormat.YEAR_MONTH_DAY_TIME,
        }) ?? '';
    const timelockEndsAtText =
        formatterUtils.formatDate(sppStageUtils.getStageMinAdvance(proposal, stage), {
            format: DateFormat.YEAR_MONTH_DAY_TIME,
        }) ?? '';

    const timelockText = {
        heading: isTimelockActive ? 'Timelock active' : isTimelockInTheFuture ? 'Timelock pending' : 'Timelock ended',
        description: isTimelockActive
            ? `Ends ${timelockEndsAtText}`
            : isTimelockInTheFuture
              ? 'Starts when previous stage is advanced'
              : `Ended ${timelockEndedAtText}`,
    };

    //TODO: clean the above to avoid lots of nested conditions
    // TODO: add translation strings to the above

    return (
        <CardEmptyState
            heading={timelockText.heading}
            description={timelockText.description}
            objectIllustration={{ object: 'SETTINGS' }}
            isStacked={false}
            className="border border-neutral-100"
        />
    );
};
