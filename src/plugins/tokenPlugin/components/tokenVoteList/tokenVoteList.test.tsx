import { generateToken } from '@/modules/finance/testUtils';
import * as useVoteListData from '@/modules/governance/hooks/useVoteListData';
import { addressUtils, OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { generateTokenVote } from '../../testUtils/generators/tokenVote';
import { VoteOption } from '../../types';
import { type ITokenVoteListProps, TokenVoteList } from './tokenVoteList';

describe('<TokenVoteList /> component', () => {
    const useVoteListDataSpy = jest.spyOn(useVoteListData, 'useVoteListData');

    afterEach(() => {
        useVoteListDataSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ITokenVoteListProps>) => {
        const completeProps: ITokenVoteListProps = {
            initialParams: { queryParams: {} },
            daoId: 'test-id',
            ...props,
        };

        return (
            <OdsModulesProvider>
                <TokenVoteList {...completeProps} />
            </OdsModulesProvider>
        );
    };

    it('fetches and renders the list of token votes', () => {
        const token = generateToken({ symbol: 'ABC' });
        const votes = [
            generateTokenVote({
                transactionHash: '0x123',
                voteOption: VoteOption.ABSTAIN,
                memberAddress: '0xF6ad40D5D477ade0C640eaD49944bdD0AA1fBF05',
                votingPower: '978645312',
                token,
            }),
            generateTokenVote({
                transactionHash: '0x456',
                voteOption: VoteOption.YES,
                memberAddress: '0x00C51Fad10462780e488B54D413aD92B28b88204',
                votingPower: '4653128946',
                token,
            }),
        ];
        useVoteListDataSpy.mockReturnValue({
            voteList: votes,
            onLoadMore: jest.fn(),
            state: 'idle',
            pageSize: 10,
            itemsCount: votes.length,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });
        render(createTestComponent());

        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(2);
        expect(links[0].getAttribute('href')).toMatch(votes[0].memberAddress);
        expect(links[1].getAttribute('href')).toMatch(votes[1].memberAddress);

        expect(screen.getByText(addressUtils.truncateAddress(votes[0].memberAddress))).toBeInTheDocument();
        expect(screen.getByText('978.65M ABC')).toBeInTheDocument();
        expect(screen.getByText('abstain')).toBeInTheDocument();

        expect(screen.getByText(addressUtils.truncateAddress(votes[1].memberAddress))).toBeInTheDocument();
        expect(screen.getByText('4.65B ABC')).toBeInTheDocument();
        expect(screen.getByText('yes')).toBeInTheDocument();
    });
});
