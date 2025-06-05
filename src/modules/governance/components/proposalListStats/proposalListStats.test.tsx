import * as daoService from '@/shared/api/daoService';
import * as pluginHooks from '@/shared/hooks/useDaoPlugins';
import { generateDao, generateReactQueryResultSuccess, generateTabComponentPlugin } from '@/shared/testUtils';
import * as formatterUtilsModule from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as proposalHooks from '../../hooks/useProposalListData';
import { generateProposal } from '../../testUtils';
import { ProposalListStats, type IProposalListStatsProps } from './proposalListStats';

describe('<ProposalListStats /> component', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useDaoPluginsSpy = jest.spyOn(pluginHooks, 'useDaoPlugins');
    const useProposalListDataSpy = jest.spyOn(proposalHooks, 'useProposalListData');
    const formatDateSpy = jest.spyOn(formatterUtilsModule.formatterUtils, 'formatDate');

    const createTestComponent = (props?: Partial<IProposalListStatsProps>) => {
        const completeProps: IProposalListStatsProps = {
            daoId: 'test-dao',
            ...props,
        };
        return <ProposalListStats {...completeProps} />;
    };

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
        useProposalListDataSpy.mockReturnValue({
            proposalList: [],
            onLoadMore: jest.fn(),
            state: 'idle',
            pageSize: 10,
            itemsCount: 0,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });
        useDaoPluginsSpy.mockReturnValue([]);
        formatDateSpy.mockReturnValue('-');
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useProposalListDataSpy.mockReset();
        useDaoPluginsSpy.mockReset();
        formatDateSpy.mockReset();
    });

    it('renders all stats with valid data and formatted relative date', () => {
        const mockProposal = generateProposal({ blockTimestamp: 1720000000 });

        useProposalListDataSpy
            .mockReturnValueOnce({
                proposalList: [mockProposal],
                onLoadMore: jest.fn(),
                state: 'idle',
                pageSize: 10,
                itemsCount: 20,
                emptyState: { heading: '', description: '' },
                errorState: { heading: '', description: '' },
            })
            .mockReturnValueOnce({
                proposalList: [],
                onLoadMore: jest.fn(),
                state: 'idle',
                pageSize: 10,
                itemsCount: 5,
                emptyState: { heading: '', description: '' },
                errorState: { heading: '', description: '' },
            });

        useDaoPluginsSpy.mockReturnValue([generateTabComponentPlugin(), generateTabComponentPlugin()]);
        formatDateSpy.mockReturnValue('13 days ago');

        render(createTestComponent());

        expect(screen.getByText(/stats.total/)).toBeInTheDocument();
        expect(screen.getByText('20')).toBeInTheDocument();

        expect(screen.getByText(/stats.executed/)).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();

        expect(screen.getByText(/stats.types/)).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();

        expect(screen.getByText(/stats.mostRecent/)).toBeInTheDocument();
        expect(screen.getByText('13')).toBeInTheDocument();
        expect(screen.getByText('days ago')).toBeInTheDocument();
    });

    it('renders "-" when data is missing', () => {
        useProposalListDataSpy
            .mockReturnValueOnce({
                proposalList: undefined,
                onLoadMore: jest.fn(),
                state: 'idle',
                pageSize: 10,
                itemsCount: undefined,
                emptyState: { heading: '', description: '' },
                errorState: { heading: '', description: '' },
            })
            .mockReturnValueOnce({
                proposalList: undefined,
                onLoadMore: jest.fn(),
                state: 'idle',
                pageSize: 10,
                itemsCount: undefined,
                emptyState: { heading: '', description: '' },
                errorState: { heading: '', description: '' },
            });

        useDaoPluginsSpy.mockReturnValue(undefined);
        formatDateSpy.mockReturnValue('-');

        render(createTestComponent());

        expect(screen.getAllByText('-')).toHaveLength(4);
    });

    it('renders settings button with correct href and label', () => {
        const subdomain = 'testdao';
        const mockDao = generateDao({ subdomain });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: mockDao }));

        useProposalListDataSpy
            .mockReturnValueOnce({
                proposalList: [generateProposal({ blockTimestamp: 1720000000 })],
                onLoadMore: jest.fn(),
                state: 'idle',
                pageSize: 10,
                itemsCount: 1,
                emptyState: { heading: '', description: '' },
                errorState: { heading: '', description: '' },
            })
            .mockReturnValueOnce({
                proposalList: [],
                onLoadMore: jest.fn(),
                state: 'idle',
                pageSize: 10,
                itemsCount: 1,
                emptyState: { heading: '', description: '' },
                errorState: { heading: '', description: '' },
            });

        render(createTestComponent());

        const button = screen.getByRole('link', {
            name: /stats.button/,
        });

        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('href', `/dao/ethereum-mainnet/${subdomain}.dao.eth/settings`);
    });
});
