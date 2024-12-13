import { Card, EmptyState } from '@aragon/gov-ui-kit';
import type { ISppProposal, ISppStage } from '../../types';
import { sppStageUtils } from '../../utils/sppStageUtils';
import { SppStageStatus } from '../sppStageStatus';

export interface ISppTimelockStageContentProps {
    /**
     * Stage to display the info for.
     */
    stage: ISppStage;
    /**
     * Parent Proposal of the stage
     */
    proposal: ISppProposal;
}

export const SppTimelockStageContent: React.FC<ISppTimelockStageContentProps> = (props) => {
    const { stage, proposal } = props;

    const isTimelockActive = stage.stageIndex === proposal.stageIndex;
    const isTimelockInTheFuture = stage.stageIndex > proposal.stageIndex;

    const dateFormatConfig = "cccc, LLLL dd yyyy 'at' HH:mm 'UTC'";

    const timelockEndedAtText = sppStageUtils.getStageEndDate(proposal, stage)?.toFormat(dateFormatConfig) ?? '';
    const timelockEndsAtText = sppStageUtils.getStageMinAdvance(proposal, stage)?.toFormat(dateFormatConfig) ?? '';

    const timelockText = {
        heading: isTimelockActive ? 'Timelock active' : isTimelockInTheFuture ? 'Timelock pending' : 'Timelock ended',
        description: isTimelockActive
            ? `Ends ${timelockEndsAtText}`
            : isTimelockInTheFuture
              ? 'Starts when previous stage is advanced'
              : `Ended ${timelockEndedAtText}`,
    };

    return (
        <div className="flex flex-col gap-2">
            <Card className="border border-neutral-100 shadow-neutral-sm">
                <EmptyState
                    heading={timelockText.heading}
                    description={timelockText.description}
                    objectIllustration={{ object: 'SETTINGS' }}
                    isStacked={false}
                />
            </Card>
            <SppStageStatus proposal={proposal} stage={stage} />
        </div>
    );
};
