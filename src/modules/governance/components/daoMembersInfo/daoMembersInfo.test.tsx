import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import * as useDaoPluginIds from '@/shared/hooks/useDaoPluginIds';
import { render, screen } from '@testing-library/react';
import { DaoMembersInfo, type IDaoMembersInfoProps } from './daoMembersInfo';

jest.mock('@/shared/components/pluginComponent', () => ({
    PluginComponent: (props: { slotId: string; pluginIds: string[] }) => (
        <div data-testid="plugin-component-mock" data-slotid={props.slotId} data-pluginids={props.pluginIds} />
    ),
}));

describe('<DaoMemberInfo /> component', () => {
    const useDaoPluginIdsSpy = jest.spyOn(useDaoPluginIds, 'useDaoPluginIds');

    beforeEach(() => {
        useDaoPluginIdsSpy.mockReturnValue([]);
    });

    afterEach(() => {
        useDaoPluginIdsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoMembersInfoProps>) => {
        const completeProps = {
            daoId: 'test-id',
            ...props,
        };

        return <DaoMembersInfo {...completeProps} />;
    };

    it('renders the plugin-specific dao members info component', () => {
        const pluginIds = ['multisig'];
        useDaoPluginIdsSpy.mockReturnValue(pluginIds);
        render(createTestComponent());
        const pluginComponent = screen.getByTestId('plugin-component-mock');
        expect(pluginComponent).toBeInTheDocument();
        expect(pluginComponent.dataset.slotid).toEqual(SettingsSlotId.SETTINGS_GOVERNANCE_DAO_MEMBERS_INFO);
        expect(pluginComponent.dataset.pluginids).toEqual(pluginIds.toString());
    });
});
