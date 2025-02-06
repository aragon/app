import * as useProposalListData from '@/modules/governance/hooks/useProposalListData';
import { generateDaoPlugin } from '@/shared/testUtils';
import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import type { IProposal } from '../../api/governanceService';
import { generateProposal } from '../../testUtils';
import { DaoProposalListDefault, type IDaoProposalListDefaultProps } from './daoProposalListDefault';

jest.mock('./daoProposalListDefaultItem', () => ({
    DaoProposalListDefaultItem: ({ proposal }: { proposal: IProposal }) => (
        <div data-testid="dao-proposal-default-list-item-mock">{proposal.title}</div>
    ),
}));

describe('<DaoProposalListDefault /> component', () => {
    const useProposalListDataSpy = jest.spyOn(useProposalListData, 'useProposalListData');

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
    });

    afterEach(() => {
        useProposalListDataSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoProposalListDefaultProps>) => {
        const completeProps: IDaoProposalListDefaultProps = {
            initialParams: { queryParams: { daoId: 'dao-id', pluginAddress: '0x123' } },
            plugin: generateDaoPlugin(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <DaoProposalListDefault {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('fetches and renders the token proposal list', () => {
        const initialParams = { queryParams: { daoId: 'dao-test', pluginAddress: '0x123' } };
        const proposals = [
            generateProposal({ title: 'First', id: '1' }),
            generateProposal({ title: 'Second', id: '2' }),
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
        render(createTestComponent({ initialParams }));
        expect(useProposalListDataSpy).toHaveBeenCalledWith(initialParams);
        expect(screen.getByText(proposals[0].title)).toBeInTheDocument();
        expect(screen.getByText(proposals[1].title)).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('does not render the data-list pagination when hidePagination is set to true', () => {
        const hidePagination = true;
        useProposalListDataSpy.mockReturnValue({
            proposalList: [generateProposal()],
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
});
