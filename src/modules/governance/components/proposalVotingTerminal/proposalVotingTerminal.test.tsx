import * as useDaoPluginIds from '@/shared/hooks/useDaoPluginIds';
import { render, screen } from '@testing-library/react';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { generateProposal } from '../../testUtils';
import { type IProposalVotingTerminalProps, ProposalVotingTerminal } from './proposalVotingTerminal';

jest.mock('@/shared/components/pluginComponent', () => ({
    PluginComponent: (props: { slotId: string; pluginIds: string[] }) => (
        <div data-testid="plugin-component-mock" data-slotid={props.slotId} data-pluginids={props.pluginIds} />
    ),
}));

describe('<ProposalVotingTerminal /> component', () => {
    const useDaoPluginIdsSpy = jest.spyOn(useDaoPluginIds, 'useDaoPluginIds');

    beforeEach(() => {
        useDaoPluginIdsSpy.mockReturnValue([]);
    });

    afterEach(() => {
        useDaoPluginIdsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IProposalVotingTerminalProps>) => {
        const completeProps: IProposalVotingTerminalProps = {
            proposal: generateProposal(),
            daoId: 'test-id',
            ...props,
        };

        return <ProposalVotingTerminal {...completeProps} />;
    };
    it('renders the proposal voting component', () => {
        render(createTestComponent());
        expect(screen.getByText(/proposalVotingTerminal.title/)).toBeInTheDocument();
        expect(screen.getByText(/proposalVotingTerminal.description/)).toBeInTheDocument();
    });

    it('renders the plugin-specific proposal breakdown component', () => {
        const pluginIds = ['multisig'];
        useDaoPluginIdsSpy.mockReturnValue(pluginIds);
        render(createTestComponent());
        const pluginComponent = screen.getByTestId('plugin-component-mock');
        expect(pluginComponent).toBeInTheDocument();
        expect(pluginComponent.dataset.slotid).toEqual(GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN);
        expect(pluginComponent.dataset.pluginids).toEqual(pluginIds.toString());
    });
});
