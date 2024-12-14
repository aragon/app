import { CardEmptyState } from '@aragon/gov-ui-kit';
import { useSppTimelockInfo } from '../../hooks/useSppTimelockInfo';
import type { ISppProposal, ISppStage } from '../../types';

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

    const timelockInfo = useSppTimelockInfo({ proposal, stage });

    return (
        <CardEmptyState
            heading={timelockInfo.heading}
            description={timelockInfo.description}
            objectIllustration={{ object: 'SETTINGS' }}
            isStacked={false}
            className="border border-neutral-100"
        />
    );
};
