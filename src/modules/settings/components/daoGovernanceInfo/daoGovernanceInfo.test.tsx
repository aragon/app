import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import type { ITabComponentPlugin } from '@/shared/components/pluginTabComponent';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import { generateDaoPlugin } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import { DaoGovernanceInfo, type IDaoGovernanceInfoProps } from './daoGovernanceInfo';

jest.mock('@/shared/components/pluginTabComponent', () => ({
    PluginTabComponent: (props: { slotId: string; plugins: ITabComponentPlugin[] }) => (
        <div data-testid="plugin-component-mock" data-slotid={props.slotId} data-plugins={props.plugins[0].id} />
    ),
}));

describe('<DaoGovernanceInfo /> component', () => {
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');

    beforeEach(() => {
        useDaoPluginsSpy.mockReturnValue([]);
    });

    afterEach(() => {
        useDaoPluginsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoGovernanceInfoProps>) => {
        const completeProps: IDaoGovernanceInfoProps = {
            daoId: 'test-id',
            plugin: generateDaoPlugin(),
            ...props,
        };

        return <DaoGovernanceInfo {...completeProps} />;
    };

    it('renders the plugin-specific dao governance info component', () => {
        const plugins = [{ id: '', uniqueId: '', label: '', meta: generateDaoPlugin(), props: {} }];
        useDaoPluginsSpy.mockReturnValue(plugins);
        render(createTestComponent());
        const pluginComponent = screen.getByTestId('plugin-component-mock');
        expect(pluginComponent).toBeInTheDocument();
        expect(pluginComponent.dataset.slotid).toEqual(SettingsSlotId.SETTINGS_GOVERNANCE_INFO);
        expect(pluginComponent.dataset.plugins).toEqual(plugins[0].id);
    });
});
