import { ProposalVotingTab, Tabs } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { generateMultisigProposal } from '../../testUtils';
import {
    type IMultisigProposalVotingBreakdownProps,
    MultisigProposalVotingBreakdown,
} from './multisigProposalVotingBreakdown';

describe('<MultisigProposalVotingBreakdown /> component', () => {
    const createTestComponent = (props?: Partial<IMultisigProposalVotingBreakdownProps>) => {
        const baseProposal = generateMultisigProposal();
        const completeProps: IMultisigProposalVotingBreakdownProps = {
            proposal: baseProposal,
            ...props,
        };

        return (
            <Tabs.Root defaultValue={ProposalVotingTab.BREAKDOWN}>
                <MultisigProposalVotingBreakdown {...completeProps} />
            </Tabs.Root>
        );
    };
    it('correctly displays the breakdown of the multisig proposal', () => {
        const proposal = generateMultisigProposal({
            settings: { minApprovals: 4, onlyListed: false },
            metrics: { totalVotes: 2 },
        });
        render(createTestComponent({ proposal }));
        expect(screen.getByText(proposal.metrics.totalVotes)).toBeInTheDocument();
        expect(screen.getByText(`of ${proposal.settings.minApprovals} members`)).toBeInTheDocument();
    });
});
