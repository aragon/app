import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { generateDaoPlugin } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import { DaoMembersInfo, type IDaoMembersInfoProps } from './daoMembersInfo';

jest.mock('@/shared/components/pluginSingleComponent', () => ({
    PluginSingleComponent: (props: { slotId: string; pluginId: string }) => (
        <div data-testid="plugin-component-mock" data-slotid={props.slotId} data-pluginid={props.pluginId} />
    ),
}));

describe('<DaoMembersInfo /> component', () => {
    const createTestComponent = (props?: Partial<IDaoMembersInfoProps>) => {
        const completeProps: IDaoMembersInfoProps = {
            daoId: 'test-id',
            plugin: generateDaoPlugin(),
            ...props,
        };

        return <DaoMembersInfo {...completeProps} />;
    };

    it('renders the plugin-specific dao members info component', () => {
        const plugin = generateDaoPlugin({ subdomain: 'token' });
        render(createTestComponent({ plugin }));
        const pluginComponent = screen.getByTestId('plugin-component-mock');
        expect(pluginComponent).toBeInTheDocument();
        expect(pluginComponent.dataset.slotid).toEqual(SettingsSlotId.SETTINGS_MEMBERS_INFO);
        expect(pluginComponent.dataset.pluginid).toEqual(plugin.subdomain);
    });
});
