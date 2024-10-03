import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import { generateDaoPlugin, generateTabComponentPlugin } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import { CreateProposalFormSettings, type ICreateProposalFormSettingsProps } from './createProposalFormSettings';

jest.mock('@/shared/components/pluginSingleComponent', () => ({
    PluginSingleComponent: (props: { slotId: string; pluginId: string }) => (
        <div data-testid="plugin-component-mock" data-slotid={props.slotId} data-pluginids={props.pluginId} />
    ),
}));

describe('<CreateProposalFormSettings /> component', () => {
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');

    afterEach(() => {
        useDaoPluginsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ICreateProposalFormSettingsProps>) => {
        const completeProps: ICreateProposalFormSettingsProps = {
            daoId: 'test',
            pluginAddress: '0x123',
            ...props,
        };

        return <CreateProposalFormSettings {...completeProps} />;
    };

    it('renders a plugin component with the plugin id and the dao-create-proposal-settings-form slot', () => {
        const plugins = [generateTabComponentPlugin({ id: 'multisig', meta: generateDaoPlugin({ address: '0x123' }) })];
        useDaoPluginsSpy.mockReturnValue(plugins);
        render(createTestComponent());
        const pluginComponent = screen.getByTestId('plugin-component-mock');
        expect(pluginComponent).toBeInTheDocument();
        expect(pluginComponent.dataset.slotid).toEqual(GovernanceSlotId.GOVERNANCE_CREATE_PROPOSAL_SETTINGS_FORM);
        expect(pluginComponent.dataset.pluginids).toEqual(plugins[0].id);
    });
});
