import * as useProposalListData from '@/modules/governance/hooks/useProposalListData';
import * as useUserVote from '@/modules/governance/hooks/useUserVote';
import { generateMultisigVote } from '@/plugins/multisigPlugin/testUtils';
import { ISppProposal } from '@/plugins/sppPlugin/types';
import { generateDaoPlugin } from '@/shared/testUtils';
import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import {
    generateSppPluginSettings,
    generateSppProposal,
    generateSppStage,
    generateSppSubProposal,
} from '../../testUtils';
import { SppProposalList, type ISppProposalListProps } from './sppProposalList';

describe('<SppProposalList /> component', () => {
    const useProposalListDataSpy = jest.spyOn(useProposalListData, 'useProposalListData');
    const useUserVoteSpy = jest.spyOn(useUserVote, 'useUserVote');

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
    });

    afterEach(() => {
        useProposalListDataSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ISppProposalListProps>) => {
        const completeProps: ISppProposalListProps = {
            initialParams: { queryParams: { daoId: '', pluginAddress: '' } },
            plugin: generateDaoPlugin(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <SppProposalList {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('fetches and renders the Spp proposal list', () => {
        const proposals: ISppProposal[] = [
            generateSppProposal({
                endDate: 0,
                title: 'Proposal 1',
                id: '1',
                subProposals: [generateSppSubProposal({ endDate: 0 }), generateSppSubProposal({ endDate: 0 })],
                settings: generateSppPluginSettings({ stages: [generateSppStage()] }),
            }),
            generateSppProposal({
                endDate: 0,
                title: 'Proposal 2',
                id: '2',
                subProposals: [generateSppSubProposal({ endDate: 0 }), generateSppSubProposal({ endDate: 0 })],
                settings: generateSppPluginSettings({ stages: [generateSppStage()] }),
            }),
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
        const proposals = [
            generateSppProposal({
                id: '1',
                subProposals: [generateSppSubProposal({ endDate: 0 })],
                settings: generateSppPluginSettings({ stages: [generateSppStage()] }),
            }),
            generateSppProposal({
                id: '2',
                subProposals: [generateSppSubProposal({ endDate: 0 })],
                settings: generateSppPluginSettings({ stages: [generateSppStage()] }),
            }),
        ];
        const hidePagination = true;
        useProposalListDataSpy.mockReturnValue({
            proposalList: proposals,
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
