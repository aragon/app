import type { IVote } from '@/modules/governance/api/governanceService';
import * as useVoteListData from '@/modules/governance/hooks/useVoteListData';
import { generateProposal } from '@/modules/governance/testUtils';
import * as daoService from '@/shared/api/daoService';
import { generateAddressInfo, generateDao, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import { addressUtils, GukModulesProvider, type VoteIndicator } from '@aragon/gov-ui-kit';
import { render, screen, within } from '@testing-library/react';
import { generateMultisigVote } from '../../testUtils';
import { type IMultisigVoteListProps, MultisigVoteList } from './multisigVoteList';

jest.mock('../../../../modules/governance/components/voteList', () => ({
    VoteProposalListItem: ({
        daoId,
        vote,
        voteIndicator,
    }: {
        vote: IVote;
        daoId: string;
        voteIndicator: VoteIndicator;
    }) => {
        const slug = `MULTISIG-${vote.proposal!.incrementalId.toString()}`;
        const href = `/test/${daoId}/proposals/${slug}`;

        return (
            <a href={href} data-testid="vote-proposal-list-item-mock">
                <span data-testid="proposal-title">{vote.proposal!.title}</span>
                <span data-testid="vote-indicator">{voteIndicator.toLowerCase()}</span>
            </a>
        );
    },
}));

describe('<MultisigVoteList /> component', () => {
    const useVoteListDataSpy = jest.spyOn(useVoteListData, 'useVoteListData');
    const getDaoUrlSpy = jest.spyOn(daoUtils, 'getDaoUrl');
    const useDaoSpy = jest.spyOn(daoService, 'useDao');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
    });

    afterEach(() => {
        useVoteListDataSpy.mockReset();
        getDaoUrlSpy.mockReset();
        useDaoSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IMultisigVoteListProps>) => {
        const completeProps: IMultisigVoteListProps = {
            initialParams: { queryParams: { pluginAddress: '0x123' } },
            daoId: 'test-id',
            ...props,
        };

        return (
            <GukModulesProvider>
                <MultisigVoteList {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders a data list with VoteDataListItem when includeInfo is false or not set', () => {
        const votes = [
            generateMultisigVote({
                transactionHash: '0x123',
                member: generateAddressInfo({ address: '0x00C51Fad10462780e488B54D413aD92B28b88204' }),
            }),
            generateMultisigVote({
                transactionHash: '0x456',
                member: generateAddressInfo({ address: '0xF6ad40D5D477ade0C640eaD49944bdD0AA1fBF05' }),
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
        expect(screen.getByText(addressUtils.truncateAddress(votes[1].member.address))).toBeInTheDocument();
        expect(screen.getAllByText('approve')).toHaveLength(2);
    });

    it('renders a data list with VoteProposalDataListItem when includeInfo is true', () => {
        const daoId = 'test-dao-id';
        const votes = [
            generateMultisigVote({
                transactionHash: '0x123',
                proposal: generateProposal({ title: 'Test Proposal 1', incrementalId: 4 }),
                blockTimestamp: 1234567890,
            }),
            generateMultisigVote({
                transactionHash: '0x456',
                proposal: generateProposal({ title: 'Test Proposal 2', incrementalId: 5 }),
                blockTimestamp: 1234567890,
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

        expect(links[0]).toHaveAttribute('href', `/test/${daoId}/proposals/MULTISIG-4`);
        expect(links[1]).toHaveAttribute('href', `/test/${daoId}/proposals/MULTISIG-5`);

        expect(within(links[0]).getByTestId('proposal-title')).toHaveTextContent(votes[0].proposal!.title);
        expect(within(links[1]).getByTestId('proposal-title')).toHaveTextContent(votes[1].proposal!.title);

        expect(screen.getAllByText('approve')).toHaveLength(2);
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
