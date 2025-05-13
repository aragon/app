import * as useProposalListData from '@/modules/governance/hooks/useProposalListData';
import * as useUserVote from '@/modules/governance/hooks/useUserVote';
import * as DaoService from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { generateTokenPluginSettings, generateTokenProposal, generateTokenVote } from '../../testUtils';
import { TokenProposalList, type ITokenProposalListProps } from './tokenProposalList';

describe('<TokenProposalList /> component', () => {
    const useProposalListDataSpy = jest.spyOn(useProposalListData, 'useProposalListData');
    const useUserVoteSpy = jest.spyOn(useUserVote, 'useUserVote');
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');

    beforeEach(() => {
        useProposalListDataSpy.mockReturnValue({
            proposalList: [],
            onLoadMore: jest.fn(),
            state: 'idle',
            pageSize: 10,
            itemsCount: 0,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });
        useUserVoteSpy.mockReturnValue(generateTokenVote());
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
    });

    afterEach(() => {
        useProposalListDataSpy.mockReset();
        useUserVoteSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ITokenProposalListProps>) => {
        const completeProps: ITokenProposalListProps = {
            initialParams: { queryParams: { daoId: 'dao-id', pluginAddress: '0x123' } },
            plugin: generateDaoPlugin(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <TokenProposalList {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('fetches and renders the token proposal list', () => {
        const settings = generateTokenPluginSettings({ historicalTotalSupply: '0' });
        const proposals = [
            generateTokenProposal({ title: 'First', id: '1', settings }),
            generateTokenProposal({ title: 'Second', id: '2', settings }),
        ];
        useProposalListDataSpy.mockReturnValue({
            proposalList: proposals,
            onLoadMore: jest.fn(),
            state: 'idle',
            pageSize: 10,
            itemsCount: proposals.length,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });
        render(createTestComponent());
        expect(screen.getByText(proposals[0].title)).toBeInTheDocument();
        expect(screen.getByText(proposals[1].title)).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('does not render the data-list pagination when hidePagination is set to true', () => {
        const hidePagination = true;
        const settings = generateTokenPluginSettings({ historicalTotalSupply: '0' });
        useProposalListDataSpy.mockReturnValue({
            proposalList: [generateTokenProposal({ settings })],
            onLoadMore: jest.fn(),
            state: 'idle',
            pageSize: 10,
            itemsCount: 0,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });
        render(createTestComponent({ hidePagination }));
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('renders the children property', () => {
        const children = 'test-children';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });

    it('uses initialParams correctly', () => {
        const initialParams = { queryParams: { daoId: 'dao-test', pluginAddress: '0x123' } };
        useProposalListDataSpy.mockReturnValue({
            proposalList: [],
            state: 'idle',
            pageSize: 10,
            itemsCount: 0,
            onLoadMore: jest.fn(),
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });

        render(createTestComponent({ initialParams }));

        expect(useProposalListDataSpy).toHaveBeenCalledWith(initialParams);
    });
});
