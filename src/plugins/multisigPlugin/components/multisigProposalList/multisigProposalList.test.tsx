import * as useProposalListData from '@/modules/governance/hooks/useProposalListData';
import * as useUserVote from '@/modules/governance/hooks/useUserVote';
import * as daoService from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { generateMultisigProposal, generateMultisigVote } from '../../testUtils';
import { MultisigProposalList, type IMultisigProposalListProps } from './multisigProposalList';

describe('<MultisigProposalList /> component', () => {
    const useProposalListDataSpy = jest.spyOn(useProposalListData, 'useProposalListData');
    const useUserVoteSpy = jest.spyOn(useUserVote, 'useUserVote');
    const useDaoSpy = jest.spyOn(daoService, 'useDao');

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
        useUserVoteSpy.mockReturnValue(generateMultisigVote());
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
    });

    afterEach(() => {
        useProposalListDataSpy.mockReset();
        useDaoSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IMultisigProposalListProps>) => {
        const completeProps: IMultisigProposalListProps = {
            initialParams: { queryParams: { daoId: '', pluginAddress: '' } },
            plugin: generateDaoPlugin(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <MultisigProposalList {...completeProps} />
            </GukModulesProvider>
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
