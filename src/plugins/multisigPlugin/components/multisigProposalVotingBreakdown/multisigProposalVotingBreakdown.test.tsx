import * as governanceService from '@/modules/governance/api/governanceService';
import { generateReactQueryResultError, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { ProposalVotingTab, Tabs } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { generateMultisigProposal } from '../../testUtils';
import {
    type IMultisigProposalVotingBreakdownProps,
    MultisigProposalVotingBreakdown,
} from './multisigProposalVotingBreakdown';

describe('<MultisigProposalVotingBreakdown /> component', () => {
    const useProposalSpy = jest.spyOn(governanceService, 'useProposal');

    afterEach(() => {
        useProposalSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IMultisigProposalVotingBreakdownProps>) => {
        const completeProps: IMultisigProposalVotingBreakdownProps = {
            proposalId: 'test-id',
            ...props,
        };

        return (
            <Tabs.Root defaultValue={ProposalVotingTab.BREAKDOWN}>
                <MultisigProposalVotingBreakdown {...completeProps} />
            </Tabs.Root>
        );
    };

    it('returns null when proposal cannot be fetched', () => {
        useProposalSpy.mockReturnValue(generateReactQueryResultError({ error: new Error() }));
        render(createTestComponent());
        expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument();
    });

    it('correctly displays the breakdown of the multisig proposal', () => {
        const proposal = generateMultisigProposal({
            settings: { minApprovals: 4, onlyListed: false },
            metrics: { totalVotes: 2 },
        });
        useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: proposal }));
        render(createTestComponent());
        expect(screen.getByText(proposal.metrics.totalVotes)).toBeInTheDocument();
        expect(screen.getByText(`of ${proposal.settings.minApprovals} members`)).toBeInTheDocument();
    });
});
