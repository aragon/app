import * as useVoteListData from '@/modules/governance/hooks/useVoteListData';
import { generateProposal } from '@/modules/governance/testUtils';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import { generateAddressInfo, generateDaoPlugin, generateTabComponentPlugin } from '@/shared/testUtils';
import { addressUtils, GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { generateMultisigVote } from '../../testUtils';
import { type IMultisigVoteListProps, MultisigVoteList } from './multisigVoteList';

describe('<MultisigVoteList /> component', () => {
    const useVoteListDataSpy = jest.spyOn(useVoteListData, 'useVoteListData');
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');

    afterEach(() => {
        useVoteListDataSpy.mockReset();
        useDaoPluginsSpy.mockReset();
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

        render(createTestComponent());

        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(2);
        expect(links[0].getAttribute('href')).toBe(`/dao/test-id/members/${votes[0].member.address}`);
        expect(links[1].getAttribute('href')).toBe(`/dao/test-id/members/${votes[1].member.address}`);

        expect(screen.getByText(addressUtils.truncateAddress(votes[0].member.address))).toBeInTheDocument();
        expect(screen.getByText(addressUtils.truncateAddress(votes[1].member.address))).toBeInTheDocument();
        expect(screen.getAllByText('approve')).toHaveLength(2);
    });

    it('renders a data list with VoteProposalDataListItem when includeInfo is true', () => {
        const daoPlugin = generateDaoPlugin({ address: '0x123', slug: 'multisig' });
        const plugins = [generateTabComponentPlugin({ id: 'token', meta: daoPlugin })];
        useDaoPluginsSpy.mockReturnValue(plugins);

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

        render(createTestComponent({ initialParams: { queryParams: { includeInfo: true, pluginAddress: '0x123' } } }));

        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(2);
        expect(links[0].getAttribute('href')).toBe(`/dao/test-id/proposals/multisig-4`);
        expect(links[1].getAttribute('href')).toBe(`/dao/test-id/proposals/multisig-5`);

        expect(screen.getByText(votes[0].proposal!.title)).toBeInTheDocument();
        expect(screen.getByText(votes[1].proposal!.title)).toBeInTheDocument();
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
