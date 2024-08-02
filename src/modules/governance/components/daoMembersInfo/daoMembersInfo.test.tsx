import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import * as DaoService from '@/shared/api/daoService';
import * as useDaoPluginIds from '@/shared/hooks/useDaoPluginIds';
import { render, screen } from '@testing-library/react';
import { DaoMembersInfo, type IDaoMembersInfoProps } from './daoMembersInfo';

jest.mock('@/shared/components/pluginComponent', () => ({
    PluginComponent: (props: { slotId: string; pluginIds: string[] }) => (
        <div data-testid="plugin-component-mock" data-slotid={props.slotId} data-pluginids={props.pluginIds} />
    ),
}));

describe('<DaoMemberInfo /> component', () => {
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');
    const useDaoPluginIdsSpy = jest.spyOn(useDaoPluginIds, 'useDaoPluginIds');

    beforeEach(() => {
        useDaoPluginIdsSpy.mockReturnValue([]);
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useDaoPluginIdsSpy.mockReset();
    });

    const createTestComponent = (props: IDaoMembersInfoProps = { daoId: 'test-id' }) => {
        const { daoId } = props;

        return <DaoMembersInfo daoId={daoId} />;
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
