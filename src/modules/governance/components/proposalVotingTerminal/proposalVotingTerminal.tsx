import { PluginComponent } from '@/shared/components/pluginComponent';
import { useDaoPluginIds } from '@/shared/hooks/useDaoPluginIds';
import { ProposalVoting, ProposalVotingStatus } from '@aragon/ods';
import type { IProposal } from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';

export interface IProposalVotingTerminalProps {
    /**
     * Proposal to display the voting terminal for.
     */
    proposal: IProposal;
    /**
     * ID of the DAO for this proposal.
     */
    daoId: string;
}

export const ProposalVotingTerminal: React.FC<IProposalVotingTerminalProps> = (props) => {
    const { proposal, daoId } = props;

    const pluginIds = useDaoPluginIds(daoId);

    return (
        <ProposalVoting.Container
            title="Voting"
            description="The proposal must pass the voting to be accepted and potential onchain actions to execute."
        >
            <ProposalVoting.Stage
                status={ProposalVotingStatus.PENDING}
                startDate={proposal.startDate * 1000}
                endDate={proposal.endDate * 1000}
            >
                <PluginComponent
                    slotId={GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN}
                    pluginIds={pluginIds}
                    proposalId={proposal.id}
                />
                <ProposalVoting.Votes />
                <ProposalVoting.Details />
            </ProposalVoting.Stage>
        </ProposalVoting.Container>
    );
};
