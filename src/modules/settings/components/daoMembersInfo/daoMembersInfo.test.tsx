import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import type { ITabComponentPlugin } from '@/shared/components/pluginTabComponent';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import { generateDaoPlugin, generateTabComponentPlugin } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import { DaoMembersInfo, type IDaoMembersInfoProps } from './daoMembersInfo';

jest.mock('@/shared/components/pluginTabComponent', () => ({
    PluginTabComponent: (props: { slotId: string; plugins: ITabComponentPlugin[] }) => (
        <div data-testid="plugin-component-mock" data-slotid={props.slotId} data-plugins={props.plugins[0].id} />
    ),
}));

describe('<DaoMembersInfo /> component', () => {
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');

    beforeEach(() => {
        useDaoPluginsSpy.mockReturnValue([]);
    });

    afterEach(() => {
        useDaoPluginsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoMembersInfoProps>) => {
        const completeProps: IDaoMembersInfoProps = {
            daoId: 'test-id',
            plugin: generateDaoPlugin(),
            ...props,
        };

        return <DaoMembersInfo {...completeProps} />;
    };

    it('renders the plugin-specific dao members info component', () => {
        const plugins = [generateTabComponentPlugin({ meta: generateDaoPlugin() })];
        useDaoPluginsSpy.mockReturnValue(plugins);
        render(createTestComponent());
        const pluginComponent = screen.getByTestId('plugin-component-mock');
        expect(pluginComponent).toBeInTheDocument();
        expect(pluginComponent.dataset.slotid).toEqual(SettingsSlotId.SETTINGS_MEMBERS_INFO);
        expect(pluginComponent.dataset.plugins).toEqual(plugins[0].id);
    });
});
