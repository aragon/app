import type { ITabComponentPlugin } from '@/shared/components/pluginTabComponent';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import { generateDaoPlugin, generateTabComponentPlugin } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { DaoMemberListContainer, type IDaoMemberListContainerProps } from './daoMemberListContainer';

jest.mock('@/shared/components/pluginTabComponent', () => ({
    PluginTabComponent: (props: { slotId: string; plugins: ITabComponentPlugin[] }) => (
        <div data-testid="plugin-component-mock" data-slotid={props.slotId} data-plugins={props.plugins[0].id} />
    ),
}));

describe('<DaoMemberListContainer /> component', () => {
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');

    afterEach(() => {
        useDaoPluginsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoMemberListContainerProps>) => {
        const completeProps: IDaoMemberListContainerProps = {
            initialParams: { queryParams: { daoId: 'test-id' } },
            ...props,
        };

        return <DaoMemberListContainer {...completeProps} />;
    };

    it('renders a plugin tab component with the body plugins and the dao-member-list slot it', () => {
        const daoPlugin = generateDaoPlugin({ address: '0x1239478' });
        const plugins = [generateTabComponentPlugin({ id: 'token', meta: daoPlugin })];
        useDaoPluginsSpy.mockReturnValue(plugins);

        render(createTestComponent());

        const pluginComponent = screen.getByTestId('plugin-component-mock');
        expect(pluginComponent).toBeInTheDocument();

        expect(pluginComponent.dataset.slotid).toEqual(GovernanceSlotId.GOVERNANCE_DAO_MEMBER_LIST);
        expect(pluginComponent.dataset.plugins).toEqual(plugins[0].id);
    });
});
