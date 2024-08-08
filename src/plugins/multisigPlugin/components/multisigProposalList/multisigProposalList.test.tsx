import * as useProposalListData from '@/modules/governance/hooks/useProposalListData';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { generateMultisigProposal } from '../../testUtils';
import { MultisigProposalList, type IMultisigProposalListProps } from './multisigProposalList';

describe('<MultisigProposalList /> component', () => {
    const useProposalListDataSpy = jest.spyOn(useProposalListData, 'useProposalListData');

    beforeEach(() => {
        useProposalListDataSpy.mockReturnValue({
            proposalList: undefined,
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

    const createTestComponent = (props?: Partial<IMultisigProposalListProps>) => {
        const completeProps: IMultisigProposalListProps = {
            initialParams: { queryParams: { daoId: 'dao-id' } },
            ...props,
        };

        return (
            <OdsModulesProvider>
                <MultisigProposalList {...completeProps} />
            </OdsModulesProvider>
        );
    };

    it('fetches and renders the multisig proposal list', () => {
        const proposals = [
            generateMultisigProposal({ title: 'First', id: '1' }),
            generateMultisigProposal({ title: 'Second', id: '2' }),
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
        useProposalListDataSpy.mockReturnValue({
            proposalList: [generateMultisigProposal()],
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
