import { generateToken } from '@/modules/finance/testUtils';
import * as useVoteListData from '@/modules/governance/hooks/useVoteListData';
import { addressUtils, OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { generateTokenVote } from '../../testUtils';
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
        const token = generateToken({ symbol: 'ABC', decimals: 18 });
        const votes = [
            generateTokenVote({
                transactionHash: '0x123',
                voteOption: VoteOption.ABSTAIN,
                memberAddress: '0xF6ad40D5D477ade0C640eaD49944bdD0AA1fBF05',
                votingPower: '997846578645312000000000',
                token,
            }),
            generateTokenVote({
                transactionHash: '0x456',
                voteOption: VoteOption.YES,
                memberAddress: '0x00C51Fad10462780e488B54D413aD92B28b88204',
                votingPower: '465319846528946000000',
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
        expect(links[0].getAttribute('href')).toBe(`/dao/test-id/members/${votes[0].memberAddress}`);
        expect(links[1].getAttribute('href')).toBe(`/dao/test-id/members/${votes[1].memberAddress}`);

        expect(screen.getByText(addressUtils.truncateAddress(votes[0].memberAddress))).toBeInTheDocument();
        expect(screen.getByText('997.85K ABC')).toBeInTheDocument();
        expect(screen.getByText('abstain')).toBeInTheDocument();

        expect(screen.getByText(addressUtils.truncateAddress(votes[1].memberAddress))).toBeInTheDocument();
        expect(screen.getByText('465.32 ABC')).toBeInTheDocument();
        expect(screen.getByText('yes')).toBeInTheDocument();
    });

    it('calls useVoteListData with the correct query initialParams', () => {
        const initialParams = {
            queryParams: {
                daoId: 'test-dao',
                address: '0xF6ad40D5D477ade0C640eaD49944bdD0AA1fBF05',
                includeInfo: true,
                pageSize: 5,
            },
        };

        useVoteListDataSpy.mockReturnValue({
            voteList: [],
            onLoadMore: jest.fn(),
            state: 'idle',
            pageSize: 10,
            itemsCount: 0,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });

        render(createTestComponent({ initialParams }));

        expect(useVoteListDataSpy).toHaveBeenCalledWith(initialParams);
    });
});
