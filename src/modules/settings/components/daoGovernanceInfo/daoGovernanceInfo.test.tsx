import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { IDaoPlugin } from '@/shared/api/daoService';
import { generateDaoPlugin } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import { DaoGovernanceInfo, type IDaoGovernanceInfoProps } from './daoGovernanceInfo';

jest.mock('@/shared/components/pluginSingleComponent', () => ({
    PluginSingleComponent: (props: { slotId: string; plugin: IDaoPlugin }) => (
        <div data-testid="plugin-component-mock" data-slotid={props.slotId} data-pluginid={props.plugin.subdomain} />
    ),
}));

describe('<DaoGovernanceInfo /> component', () => {
    const createTestComponent = (props?: Partial<IDaoGovernanceInfoProps>) => {
        const completeProps: IDaoGovernanceInfoProps = {
            daoId: 'test-id',
            plugin: generateDaoPlugin(),
            ...props,
        };

        return <DaoGovernanceInfo {...completeProps} />;
    };

    it('renders the plugin-specific dao governance info component', () => {
        const plugin = generateDaoPlugin({ subdomain: 'multisig' });
        render(createTestComponent({ plugin }));
        const pluginComponent = screen.getByTestId('plugin-component-mock');
        expect(pluginComponent).toBeInTheDocument();
        expect(pluginComponent.dataset.slotid).toEqual(SettingsSlotId.SETTINGS_GOVERNANCE_INFO);
        expect(pluginComponent.dataset.pluginid).toEqual(plugin.subdomain);
    });
});
