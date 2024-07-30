import { generateToken } from '@/modules/finance/testUtils';
import * as governanceService from '@/modules/governance/api/governanceService';
import { generateReactQueryResultError, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { ProposalVotingTab, Tabs } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { generateDaoTokenSettings, generateTokenProposal } from '../../testUtils';
import { TokenProposalVotingBreakdown, type ITokenProposalVotingBreakdownProps } from './tokenProposalVotingBreakdown';

describe('<TokenProposalVotingBreakdown /> component', () => {
    const useProposalSpy = jest.spyOn(governanceService, 'useProposal');

    afterEach(() => {
        useProposalSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ITokenProposalVotingBreakdownProps>) => {
        const completeProps: ITokenProposalVotingBreakdownProps = {
            proposalId: 'proposal-id',
            ...props,
        };

        return (
            <Tabs.Root defaultValue={ProposalVotingTab.BREAKDOWN}>
                <TokenProposalVotingBreakdown {...completeProps} />
            </Tabs.Root>
        );
    };

    it('returns null when proposal cannot be fetched', () => {
        useProposalSpy.mockReturnValue(generateReactQueryResultError({ error: new Error() }));
        render(createTestComponent());
        expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument();
    });

    it('WIP', () => {
        const token = generateToken({ totalSupply: '100' });
        const settings = { ...generateDaoTokenSettings().settings, minParticipation: 2000 };
        const proposal = generateTokenProposal({ token, settings });
        useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: proposal }));
        render(createTestComponent());
        expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });
});
