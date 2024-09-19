import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import * as useDaoPluginIds from '@/shared/hooks/useDaoPluginIds';
import * as useSlotFunction from '@/shared/hooks/useSlotFunction';
import { ProposalStatus } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { generateProposal } from '../../testUtils';
import { type IProposalVotingTerminalProps, ProposalVotingTerminal } from './proposalVotingTerminal';

jest.mock('@/shared/components/pluginComponent', () => ({
    PluginComponent: (props: { slotId: string; pluginIds: string[] }) => (
        <div data-testid="plugin-component-mock" data-slotid={props.slotId} data-pluginids={props.pluginIds} />
    ),
}));

jest.mock('../voteList', () => ({
    VoteList: () => <div data-testid="vote-list-mock" />,
}));

describe('<ProposalVotingTerminal /> component', () => {
    const useDaoPluginIdsSpy = jest.spyOn(useDaoPluginIds, 'useDaoPluginIds');
    const useSlotFunctionSpy = jest.spyOn(useSlotFunction, 'useSlotFunction');

    beforeEach(() => {
        useDaoPluginIdsSpy.mockReturnValue([]);
    });

    afterEach(() => {
        useDaoPluginIdsSpy.mockReset();
        useSlotFunctionSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IProposalVotingTerminalProps>) => {
        const completeProps: IProposalVotingTerminalProps = {
            proposal: generateProposal(),
            daoId: 'test-id',
            status: ProposalStatus.PENDING,
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
        const pluginComponent = screen.getAllByTestId('plugin-component-mock');
        expect(pluginComponent[0]).toBeInTheDocument();
        expect(pluginComponent[0].dataset.slotid).toEqual(GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN);
        expect(pluginComponent[0].dataset.pluginids).toEqual(pluginIds.toString());
    });

    it('renders the list of votes', async () => {
        render(createTestComponent());
        await userEvent.click(screen.getByRole('tab', { name: 'Votes' }));
        expect(screen.getByTestId('vote-list-mock')).toBeInTheDocument();
    });

    it('renders the proposal settings', () => {
        const pluginIds = ['plugin-id'];
        const daoId = 'test-id';
        const settings = { pluginConfig: 'pluginValue' };
        const parsedSettings = { term: 'plugin-term', definition: 'plugin-value' };
        const proposal = generateProposal({ settings });

        useDaoPluginIdsSpy.mockReturnValue(pluginIds);
        useSlotFunctionSpy.mockReturnValue([parsedSettings]);

        render(createTestComponent({ daoId, proposal }));
        expect(useSlotFunctionSpy).toHaveBeenCalledWith({
            params: { daoId, settings: proposal.settings },
            pluginIds,
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
        });
        expect(screen.getByText(parsedSettings.term)).toBeInTheDocument();
        expect(screen.getByText(parsedSettings.definition)).toBeInTheDocument();
    });
});
