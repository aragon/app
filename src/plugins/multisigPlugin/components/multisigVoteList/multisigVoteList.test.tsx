import * as useVoteListData from '@/modules/governance/hooks/useVoteListData';
import { addressUtils, OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { generateMultisigVote } from '../../testUtils';
import { type IMultisigVoteListProps, MultisigVoteList } from './multisigVoteList';

describe('<MultisigVoteList /> component', () => {
    const useVoteListDataSpy = jest.spyOn(useVoteListData, 'useVoteListData');

    afterEach(() => {
        useVoteListDataSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IMultisigVoteListProps>) => {
        const completeProps: IMultisigVoteListProps = {
            params: { queryParams: {} },
            daoId: 'test-id',
            ...props,
        };

        return (
            <OdsModulesProvider>
                <MultisigVoteList {...completeProps} />
            </OdsModulesProvider>
        );
    };

    it('fetches and renders the list of token votes', () => {
        const votes = [
            generateMultisigVote({
                transactionHash: '0x123',
                memberAddress: '0x00C51Fad10462780e488B54D413aD92B28b88204',
            }),
            generateMultisigVote({
                transactionHash: '0x456',
                memberAddress: '0xF6ad40D5D477ade0C640eaD49944bdD0AA1fBF05',
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
        expect(screen.getByText(addressUtils.truncateAddress(votes[1].memberAddress))).toBeInTheDocument();
        expect(screen.getAllByText('approve')).toHaveLength(2);
    });
});
