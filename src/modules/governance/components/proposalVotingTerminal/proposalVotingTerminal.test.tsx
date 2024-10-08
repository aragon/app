import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import * as useSlotSingleFunction from '@/shared/hooks/useSlotSingleFunction';
import { ProposalStatus } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { generateProposal } from '../../testUtils';
import { type IProposalVotingTerminalProps, ProposalVotingTerminal } from './proposalVotingTerminal';

jest.mock('@/shared/components/pluginSingleComponent', () => ({
    PluginSingleComponent: (props: { slotId: string; pluginId: string }) => (
        <div data-testid="plugin-component-mock" data-slotid={props.slotId} data-pluginid={props.pluginId} />
    ),
}));

jest.mock('../voteList', () => ({
    VoteList: () => <div data-testid="vote-list-mock" />,
}));

describe('<ProposalVotingTerminal /> component', () => {
    const useSlotSingleFunctionSpy = jest.spyOn(useSlotSingleFunction, 'useSlotSingleFunction');

    afterEach(() => {
        useSlotSingleFunctionSpy.mockReset();
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
        const proposal = generateProposal({ pluginSubdomain: 'multisig' });
        render(createTestComponent({ proposal }));
        const pluginComponent = screen.getAllByTestId('plugin-component-mock');
        expect(pluginComponent[0]).toBeInTheDocument();
        expect(pluginComponent[0].dataset.slotid).toEqual(GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN);
        expect(pluginComponent[0].dataset.pluginid).toEqual(proposal.pluginSubdomain);
    });

    it('renders the list of votes when proposal status is not pending or unreached', async () => {
        render(createTestComponent({ status: ProposalStatus.ACTIVE }));
        await userEvent.click(screen.getByRole('tab', { name: 'Votes' }));
        expect(screen.getByTestId('vote-list-mock')).toBeInTheDocument();
    });

    it('renders the proposal settings', () => {
        const daoId = 'test-id';
        const settings = { pluginConfig: 'pluginValue' };
        const parsedSettings = { term: 'plugin-term', definition: 'plugin-value' };
        const proposal = generateProposal({ settings, pluginSubdomain: 'plugin-id' });

        useSlotSingleFunctionSpy.mockReturnValue([parsedSettings]);

        render(createTestComponent({ daoId, proposal }));
        expect(useSlotSingleFunctionSpy).toHaveBeenCalledWith({
            params: { daoId, settings: proposal.settings, pluginAddress: proposal.pluginAddress },
            pluginId: proposal.pluginSubdomain,
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
        });
        expect(screen.getByText(parsedSettings.term)).toBeInTheDocument();
        expect(screen.getByText(parsedSettings.definition)).toBeInTheDocument();
    });
});
