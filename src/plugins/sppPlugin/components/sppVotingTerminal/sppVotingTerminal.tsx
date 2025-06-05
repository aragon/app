import { ProposalVoting } from '@aragon/gov-ui-kit';
import { useEffect, useState } from 'react';
import { type ISppProposal } from '../../types';
import { SppVotingTerminalStage } from './components/sppVotingTerminalStage';

export interface ISppVotingTerminalProps {
    /**
     * ID of the DAO for this proposal.
     */
    daoId: string;
    /**
     * Proposal to display the voting terminal for.
     */
    proposal: ISppProposal;
}

export const SppVotingTerminal: React.FC<ISppVotingTerminalProps> = (props) => {
    const { daoId, proposal } = props;

    const [activeStage, setActiveStage] = useState<string | undefined>(proposal.stageIndex.toString());

    // Update active stage when refetching the proposal (e.g. after advancing a stage)
    useEffect(() => setActiveStage(proposal.stageIndex.toString()), [proposal.stageIndex]);

    return (
        <ProposalVoting.StageContainer activeStage={activeStage} onStageClick={setActiveStage}>
            {proposal.settings.stages.map((stage) => (
                <SppVotingTerminalStage key={stage.stageIndex} daoId={daoId} stage={stage} proposal={proposal} />
            ))}
        </ProposalVoting.StageContainer>
    );
};
