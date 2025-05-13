import { generateToken } from '@/modules/finance/testUtils';
import { type IVote } from '@/modules/governance/api/governanceService';
import * as useVoteListData from '@/modules/governance/hooks/useVoteListData';
import { generateProposal } from '@/modules/governance/testUtils';
import { generateAddressInfo } from '@/shared/testUtils';
import { addressUtils, GukModulesProvider, type VoteIndicator } from '@aragon/gov-ui-kit';
import { render, screen, within } from '@testing-library/react';
import { daoUtils } from '../../../../shared/utils/daoUtils';
import { generateTokenVote } from '../../testUtils';
import { VoteOption } from '../../types';
import { type ITokenVoteListProps, TokenVoteList } from './tokenVoteList';

jest.mock('../../../../modules/governance/components/voteList', () => ({
    VoteProposalListItem: ({
        vote,
        daoId,
        voteIndicator,
    }: {
        vote: IVote;
        daoId: string;
        voteIndicator: VoteIndicator;
    }) => {
        const slug = `TOKENVOTING-${vote.proposal!.incrementalId.toString()}`;
        const href = `/test/${daoId}/proposals/${slug}`;

        return (
            <a href={href} data-testid="vote-proposal-list-item-mock">
                <span data-testid="proposal-title">{vote.proposal!.title}</span>
                <span data-testid="vote-indicator">{voteIndicator.toLowerCase()}</span>
            </a>
        );
    },
}));

describe('<TokenVoteList /> component', () => {
    const useVoteListDataSpy = jest.spyOn(useVoteListData, 'useVoteListData');
    const getDaoUrlSpy = jest.spyOn(daoUtils, 'getDaoUrl');

    afterEach(() => {
        useVoteListDataSpy.mockReset();
        getDaoUrlSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ITokenVoteListProps>) => {
        const completeProps: ITokenVoteListProps = {
            initialParams: { queryParams: { pluginAddress: '0x123' } },
            daoId: 'test-id',
            ...props,
        };

        return (
            <GukModulesProvider>
                <TokenVoteList {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders a data list with VoteDataListItem when includeInfo is false or not set', () => {
        const token = generateToken({ symbol: 'ABC', decimals: 18 });
        const votes = [
            generateTokenVote({
                transactionHash: '0x123',
                voteOption: VoteOption.ABSTAIN,
                member: generateAddressInfo({ address: '0xF6ad40D5D477ade0C640eaD49944bdD0AA1fBF05' }),
                votingPower: '997846578645312000000000',
                token,
            }),
            generateTokenVote({
                transactionHash: '0x456',
                voteOption: VoteOption.YES,
                member: generateAddressInfo({ address: '0x00C51Fad10462780e488B54D413aD92B28b88204' }),
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

        const memberLink = '/dao/ethereum-sepolia/test-member-address';
        getDaoUrlSpy.mockReturnValue(memberLink);

        render(createTestComponent());

        expect(getDaoUrlSpy.mock.calls[0][1]).toEqual(`members/${votes[0].member.address}`);
        expect(getDaoUrlSpy.mock.calls[1][1]).toEqual(`members/${votes[1].member.address}`);

        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(2);
        expect(links[0].getAttribute('href')).toBe(memberLink);
        expect(links[1].getAttribute('href')).toBe(memberLink);

        expect(screen.getByText(addressUtils.truncateAddress(votes[0].member.address))).toBeInTheDocument();
        expect(screen.getByText('997.85K ABC')).toBeInTheDocument();
        expect(screen.getByText('abstain')).toBeInTheDocument();

        expect(screen.getByText(addressUtils.truncateAddress(votes[1].member.address))).toBeInTheDocument();
        expect(screen.getByText('465.32 ABC')).toBeInTheDocument();
        expect(screen.getByText('yes')).toBeInTheDocument();
    });

    it('renders a data list with VoteProposalDataListItem when includeInfo is true', () => {
        const daoId = 'test-dao-id';
        const token = generateToken({ symbol: 'ABC', decimals: 18 });
        const votes = [
            generateTokenVote({
                transactionHash: '0x123',
                voteOption: VoteOption.YES,
                proposal: generateProposal({ title: 'Test Proposal 1', incrementalId: 2 }),
                blockTimestamp: 1234567890,
                token,
            }),
            generateTokenVote({
                transactionHash: '0x456',
                voteOption: VoteOption.NO,
                proposal: generateProposal({ title: 'Test Proposal 2', incrementalId: 3 }),
                blockTimestamp: 1234567890,
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

        render(
            createTestComponent({
                daoId,
                initialParams: { queryParams: { includeInfo: true, pluginAddress: '0x123' } },
            }),
        );

        const links = screen.getAllByTestId('vote-proposal-list-item-mock');
        expect(links).toHaveLength(2);

        expect(links[0]).toHaveAttribute('href', `/test/${daoId}/proposals/TOKENVOTING-2`);
        expect(links[1]).toHaveAttribute('href', `/test/${daoId}/proposals/TOKENVOTING-3`);

        expect(within(links[0]).getByTestId('proposal-title')).toHaveTextContent(votes[0].proposal!.title);
        expect(within(links[1]).getByTestId('proposal-title')).toHaveTextContent(votes[1].proposal!.title);
        expect(within(links[0]).getByTestId('vote-indicator')).toHaveTextContent('yes');
        expect(within(links[1]).getByTestId('vote-indicator')).toHaveTextContent('no');
    });

    it('calls useVoteListData with the correct query initialParams', () => {
        const initialParams = {
            queryParams: {
                daoId: 'test-dao',
                address: '0xF6ad40D5D477ade0C640eaD49944bdD0AA1fBF05',
                pluginAddress: '0x123',
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
