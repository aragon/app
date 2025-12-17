import * as formatterUtilsModule from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as daoService from '@/shared/api/daoService';
import * as pluginHooks from '@/shared/hooks/useDaoPlugins';
import { generateDao, generateFilterComponentPlugin, generateReactQueryResultSuccess } from '@/shared/testUtils';
import * as proposalHooks from '../../hooks/useProposalListData';
import { generateProposal } from '../../testUtils';
import { type IProposalListStatsProps, ProposalListStats } from './proposalListStats';

const createProposalListData = (
    values?: Partial<ReturnType<typeof proposalHooks.useProposalListData>>
): ReturnType<typeof proposalHooks.useProposalListData> => ({
    proposalList: [],
    onLoadMore: jest.fn(),
    state: 'idle',
    pageSize: 10,
    itemsCount: 0,
    emptyState: { heading: '', description: '' },
    errorState: { heading: '', description: '' },
    ...values,
});

describe('<ProposalListStats /> component', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useDaoPluginsSpy = jest.spyOn(pluginHooks, 'useDaoPlugins');
    const useProposalListDataSpy = jest.spyOn(proposalHooks, 'useProposalListData');
    const formatDateSpy = jest.spyOn(formatterUtilsModule.formatterUtils, 'formatDate');

    const createTestComponent = (props?: Partial<IProposalListStatsProps>) => {
        const completeProps: IProposalListStatsProps = {
            dao: generateDao(),
            initialParams: { queryParams: { daoId: 'dao-id' } },
            ...props,
        };
        return <ProposalListStats {...completeProps} />;
    };

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
        useProposalListDataSpy.mockReturnValue(createProposalListData());
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
        const proposals = [generateProposal({ blockTimestamp: 1_720_000_000 })];
        useProposalListDataSpy
            .mockReturnValueOnce(
                createProposalListData({
                    proposalList: proposals,
                    itemsCount: 20,
                })
            )
            .mockReturnValueOnce(createProposalListData({ proposalList: [], itemsCount: 5 }));

        useDaoPluginsSpy.mockReturnValue([generateFilterComponentPlugin(), generateFilterComponentPlugin()]);
        formatDateSpy.mockReturnValue('13 days ago');

        render(createTestComponent());

        expect(screen.getByText(/proposalListStats.total/)).toBeInTheDocument();
        expect(screen.getByText('20')).toBeInTheDocument();

        expect(screen.getByText(/proposalListStats.executed/)).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();

        expect(screen.getByText(/proposalListStats.types/)).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();

        expect(screen.getByText(/proposalListStats.mostRecent/)).toBeInTheDocument();
        expect(screen.getByText('13')).toBeInTheDocument();
        expect(screen.getByText(/proposalListStats.recentUnit/)).toBeInTheDocument();
    });

    it('renders "-" when data is missing', () => {
        useProposalListDataSpy
            .mockReturnValueOnce(createProposalListData({ itemsCount: undefined }))
            .mockReturnValueOnce(createProposalListData({ itemsCount: undefined }));

        useDaoPluginsSpy.mockReturnValue(undefined);
        formatDateSpy.mockReturnValue('-');

        render(createTestComponent());
        expect(screen.getAllByText('-')).toHaveLength(4);
    });

    it('renders settings button with correct href and label', () => {
        const address = '0xTest';
        const dao = generateDao({ address });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));

        render(createTestComponent({ dao }));

        const button = screen.getByRole('link', {
            name: /proposalListStats.button/,
        });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('href', `/dao/ethereum-mainnet/${address}/settings#governance`);
    });
});
