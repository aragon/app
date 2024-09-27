import { generateToken } from '@/modules/finance/testUtils';
import * as useVotedStatus from '@/modules/governance/hooks/useVotedStatus';
import { OdsModulesProvider, ProposalStatus } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { generateDaoTokenSettings, generateTokenProposal } from '../../testUtils';
import { VoteOption } from '../../types';
import { tokenProposalUtils } from '../../utils/tokenProposalUtils';
import { type ITokenProposalListItemProps, TokenProposalListItem } from './tokenProposalListItem';

describe('<TokenProposalListItem /> component', () => {
    const getWinningOptionSpy = jest.spyOn(tokenProposalUtils, 'getWinningOption');
    const getTotalVotesSpy = jest.spyOn(tokenProposalUtils, 'getTotalVotes');
    const getProposalStatusSpy = jest.spyOn(tokenProposalUtils, 'getProposalStatus');
    const useVotedStatusSpy = jest.spyOn(useVotedStatus, 'useVotedStatus');

    beforeEach(() => {
        useVotedStatusSpy.mockReturnValue({ voted: false });
    });

    afterEach(() => {
        getWinningOptionSpy.mockReset();
        getTotalVotesSpy.mockReset();
        getProposalStatusSpy.mockReset();
        useVotedStatusSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ITokenProposalListItemProps>) => {
        const completeProps: ITokenProposalListItemProps = {
            proposal: generateTokenProposal(),
            daoId: 'dao-id',
            ...props,
        };

        return (
            <OdsModulesProvider>
                <TokenProposalListItem {...completeProps} />
            </OdsModulesProvider>
        );
    };

    it('renders the token proposal', () => {
        const proposal = generateTokenProposal({ settings: generateDaoTokenSettings({ historicalTotalSupply: '0' }) });
        render(createTestComponent({ proposal }));
        expect(screen.getByText(proposal.title)).toBeInTheDocument();
    });

    it('sets the correct link for proposal page', () => {
        const proposal = generateTokenProposal({ id: 'proposal-id' });
        const daoId = 'dao-id';
        render(createTestComponent({ proposal }));
        expect(screen.getAllByRole('link')[0].getAttribute('href')).toEqual(`/dao/${daoId}/proposals/${proposal.id}`);
    });

    it('renders the parsed amount and percentage of winning option', () => {
        const votes = [{ type: VoteOption.YES, totalVotingPower: '80000' }];
        const settings = generateDaoTokenSettings({ token: generateToken({ decimals: 2, symbol: 'TEST' }) });
        const proposal = generateTokenProposal({ metrics: { votesByOption: votes }, settings });
        getWinningOptionSpy.mockReturnValue(VoteOption.YES);
        getTotalVotesSpy.mockReturnValue(BigInt(100000));
        getProposalStatusSpy.mockReturnValue(ProposalStatus.ACTIVE);
        render(createTestComponent({ proposal }));
        expect(screen.getByText('Winning Option')).toBeInTheDocument();
        expect(screen.getByText(/tokenProposalListItem.yes/)).toBeInTheDocument();
        expect(screen.getByText('80%')).toBeInTheDocument();
        expect(screen.getByText('800 TEST')).toBeInTheDocument();
    });

    it('does not render winning option when no one voted yet', () => {
        const proposal = generateTokenProposal({ metrics: { votesByOption: [] } });
        getWinningOptionSpy.mockReturnValue(undefined);
        getProposalStatusSpy.mockReturnValue(ProposalStatus.ACTIVE);
        render(createTestComponent({ proposal }));
        expect(screen.queryByText('Winning Option')).not.toBeInTheDocument();
    });

    it('renders abstain as winning option with 100% when the are only abstain votes', () => {
        const votes = [{ type: VoteOption.ABSTAIN, totalVotingPower: '145' }];
        const settings = generateDaoTokenSettings({ token: generateToken({ decimals: 3, symbol: 'ABS' }) });
        const proposal = generateTokenProposal({ metrics: { votesByOption: votes }, settings });
        getWinningOptionSpy.mockReturnValue(VoteOption.ABSTAIN);
        getTotalVotesSpy.mockReturnValue(BigInt(0));
        getProposalStatusSpy.mockReturnValue(ProposalStatus.ACTIVE);
        render(createTestComponent({ proposal }));
        expect(screen.getByText(/tokenProposalListItem.abstain/)).toBeInTheDocument();
        expect(screen.getByText('100%')).toBeInTheDocument();
        expect(screen.getByText('0.15 ABS')).toBeInTheDocument();
    });
});
