import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import * as useSlotSingleFunction from '@/shared/hooks/useSlotSingleFunction';
import { generateDaoPlugin, generateTabComponentPlugin } from '@/shared/testUtils';
import { GukModulesProvider, ProposalStatus } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { generateProposal } from '../../testUtils';
import { DaoProposalListDefaultItem, type IDaoProposalListDefaultItemProps } from './daoProposalListDefaultItem';

describe('<DaoProposalListDefaultItem /> component', () => {
    const useSlotSingleFunctionSpy = jest.spyOn(useSlotSingleFunction, 'useSlotSingleFunction');
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');

    beforeEach(() => {
        useDaoPluginsSpy.mockReturnValue([generateTabComponentPlugin({ meta: generateDaoPlugin() })]);
    });

    afterEach(() => {
        useSlotSingleFunctionSpy.mockReset();
        useDaoPluginsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoProposalListDefaultItemProps>) => {
        const completeProps: IDaoProposalListDefaultItemProps = {
            proposal: generateProposal(),
            daoId: 'dao-test',
            ...props,
        };

        return (
            <GukModulesProvider>
                <DaoProposalListDefaultItem {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the proposal info', () => {
        const proposal = generateProposal({ title: 'my-proposal', summary: 'proposal-summary' });
        render(createTestComponent({ proposal }));
        expect(screen.getByText(proposal.title)).toBeInTheDocument();
        expect(screen.getByText(proposal.summary)).toBeInTheDocument();
    });

    it('uses the plugin slot-function to process the proposal status', () => {
        const status = ProposalStatus.EXECUTABLE;
        useSlotSingleFunctionSpy.mockReturnValue(status);
        render(createTestComponent());
        expect(screen.getByText(/Executable/)).toBeInTheDocument();
    });
});
