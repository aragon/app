import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import * as useDaoPluginInfo from '@/shared/hooks/useDaoPluginInfo';
import * as useSlotSingleFunction from '@/shared/hooks/useSlotSingleFunction';
import { generatePluginSettings } from '@/shared/testUtils';
import { ProposalStatus } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as wagmi from 'wagmi';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { generateProposal } from '../../testUtils';
import { type IProposalVotingTerminalProps, ProposalVotingTerminal } from './proposalVotingTerminal';

jest.mock('@/shared/components/pluginSingleComponent', () => ({
    PluginSingleComponent: (props: { slotId: string; pluginId: string }) => (
        <div data-testid="plugin-component-mock" data-slotid={props.slotId} data-pluginid={props.pluginId} />
    ),
}));

jest.mock('../voteList', () => ({ VoteList: () => <div data-testid="vote-list-mock" /> }));

describe('<ProposalVotingTerminal /> component', () => {
    const useSlotSingleFunctionSpy = jest.spyOn(useSlotSingleFunction, 'useSlotSingleFunction');
    const useAccountSpy = jest.spyOn(wagmi, 'useAccount');
    const useDaoPluginInfoSpy = jest.spyOn(useDaoPluginInfo, 'useDaoPluginInfo');

    beforeEach(() => {
        useAccountSpy.mockReturnValue({} as wagmi.UseAccountReturnType);
        useDaoPluginInfoSpy.mockReturnValue([]);
    });

    afterEach(() => {
        useAccountSpy.mockReset();
        useSlotSingleFunctionSpy.mockReset();
        useDaoPluginInfoSpy.mockReset();
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

    it('renders the plugin info and proposal settings', () => {
        const daoId = 'test-id';
        const settings = generatePluginSettings();
        const parsedSettings = { term: 'plugin-term', definition: 'plugin-value' };
        const proposal = generateProposal({ settings, pluginSubdomain: 'plugin-id' });

        useSlotSingleFunctionSpy.mockReturnValue([parsedSettings]);
        useDaoPluginInfoSpy.mockImplementation((params) => params.settings!);

        render(createTestComponent({ daoId, proposal }));
        expect(useDaoPluginInfoSpy).toHaveBeenCalled();
        const expectedParams = { daoId, settings: proposal.settings, pluginAddress: proposal.pluginAddress };
        expect(useSlotSingleFunctionSpy).toHaveBeenCalledWith({
            params: expectedParams,
            pluginId: proposal.pluginSubdomain,
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
        });
        expect(screen.getByText(parsedSettings.term)).toBeInTheDocument();
        expect(screen.getByText(parsedSettings.definition)).toBeInTheDocument();
    });
});
