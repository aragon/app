import { generateToken } from '@/modules/finance/testUtils';
import * as governanceService from '@/modules/governance/api/governanceService';
import { generateReactQueryResultError, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { ProposalVotingTab, Tabs } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { generateDaoTokenSettings, generateTokenProposal } from '../../testUtils';
import { VoteOption } from '../../types/enum/voteOption';
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

    it('correctly displays the breakdown of the token proposal', () => {
        const token = generateToken({ totalSupply: '1000000', decimals: 1, symbol: 'TTT' });
        const settings = { ...generateDaoTokenSettings().settings, minParticipation: 200000, supportThreshold: 500000 };
        const votesByOption = [
            { type: VoteOption.YES, totalVotingPower: '7500' },
            { type: VoteOption.NO, totalVotingPower: '2500' },
        ];
        const proposal = generateTokenProposal({ token, settings, metrics: { votesByOption } });
        useProposalSpy.mockReturnValue(generateReactQueryResultSuccess({ data: proposal }));
        render(createTestComponent());
        expect(screen.getByRole('tabpanel')).toBeInTheDocument();

        expect(screen.getAllByRole('progressbar')[0].dataset.value).toEqual('75');
        expect(screen.getAllByText('750')).toHaveLength(2);

        expect(screen.getAllByRole('progressbar')[1].dataset.value).toEqual('1');
        expect(screen.getByText('0')).toBeInTheDocument();

        expect(screen.getAllByRole('progressbar')[2].dataset.value).toEqual('25');
        expect(screen.getByText('250')).toBeInTheDocument();

        expect(screen.getByText('75%')).toBeInTheDocument(); // support
        expect(screen.getByText('5%')).toBeInTheDocument(); // minimum participation
    });
});
