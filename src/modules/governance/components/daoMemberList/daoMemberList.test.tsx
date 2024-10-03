import type { ITabComponentPlugin } from '@/shared/components/pluginTabComponent';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import { generateDaoPlugin } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { DaoMemberList, type IDaoMemberListProps } from './daoMemberList';

jest.mock('@/shared/components/pluginTabComponent', () => ({
    PluginTabComponent: (props: { slotId: string; plugins: ITabComponentPlugin[] }) => (
        <div data-testid="plugin-component-mock" data-slotid={props.slotId} data-plugins={props.plugins[0].id} />
    ),
}));

describe('<DaoMemberList /> component', () => {
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');

    afterEach(() => {
        useDaoPluginsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoMemberListProps>) => {
        const completeProps: IDaoMemberListProps = {
            initialParams: { queryParams: { daoId: 'test-id', pluginAddress: '0x123' } },
            ...props,
        };

        return <DaoMemberList {...completeProps} />;
    };

    it('renders a plugin tab component with the body plugins and the dao-member-list slot it', () => {
        const daoPlugin = generateDaoPlugin({ address: '0x1239478' });
        const plugins = [{ id: 'token', uniqueId: '0x123-token', label: 'Token', meta: daoPlugin, props: {} }];
        useDaoPluginsSpy.mockReturnValue(plugins);

        render(createTestComponent());

        const pluginComponent = screen.getByTestId('plugin-component-mock');
        expect(pluginComponent).toBeInTheDocument();

        expect(pluginComponent.dataset.slotid).toEqual(GovernanceSlotId.GOVERNANCE_DAO_MEMBER_LIST);
        expect(pluginComponent.dataset.plugins).toEqual(plugins[0].id);
    });
});
