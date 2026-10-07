import { render, screen } from '@testing-library/react';
import * as daoService from '@/shared/api/daoService';
import { PluginInterfaceType } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import {
    generateDao,
    generateDaoPlugin,
    generateFilterComponentPlugin,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import {
    DaoMemberListContainer,
    type IDaoMemberListContainerProps,
} from './daoMemberListContainer';

jest.mock('@/shared/components/pluginFilterComponent', () => ({
    PluginFilterComponent: (props: { plugins: IFilterComponentPlugin[] }) => (
        <div
            data-labels={props.plugins.map(({ label }) => label).join(',')}
            data-testid="plugin-filter-mock"
        >
            {props.plugins[0]?.renderContent?.()}
        </div>
    ),
}));

jest.mock('@/shared/components/pluginSingleComponent', () => ({
    PluginSingleComponent: (props: { pluginId: string; slotId: string }) => (
        <div
            data-pluginid={props.pluginId}
            data-slotid={props.slotId}
            data-testid="plugin-component-mock"
        />
    ),
}));

describe('<DaoMemberListContainer /> component', () => {
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    beforeEach(() => {
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao() }),
        );
    });

    afterEach(() => {
        useDaoPluginsSpy.mockReset();
        useDaoSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IDaoMemberListContainerProps>,
    ) => {
        const completeProps: IDaoMemberListContainerProps = {
            initialParams: { queryParams: { daoId: 'test-id' } },
            ...props,
        };

        return <DaoMemberListContainer {...completeProps} />;
    };

    it('renders a plugin tab component with the body plugins and the dao-member-list slot it', () => {
        const daoPlugin = generateDaoPlugin({ address: '0x1239478' });
        const plugins = [
            generateFilterComponentPlugin({ id: 'token', meta: daoPlugin }),
        ];
        useDaoPluginsSpy.mockReturnValue(plugins);

        render(createTestComponent());

        const pluginComponent = screen.getByTestId('plugin-component-mock');
        expect(pluginComponent).toBeInTheDocument();

        expect(pluginComponent.dataset.slotid).toEqual(
            GovernanceSlotId.GOVERNANCE_DAO_MEMBER_LIST,
        );
        expect(pluginComponent.dataset.pluginid).toEqual(
            daoPlugin.interfaceType,
        );
    });

    it('renders a Safe body as an ordinary member tab', () => {
        const safeAddress = '0x1234567890123456789012345678901234567890';
        const safePlugin = generateDaoPlugin({
            address: safeAddress,
            interfaceType: PluginInterfaceType.SAFE,
            isBody: true,
            name: 'Safe',
            slug: 'safe',
        });
        useDaoPluginsSpy.mockReturnValue([
            generateFilterComponentPlugin({
                id: PluginInterfaceType.SAFE,
                meta: safePlugin,
            }),
        ]);

        render(createTestComponent());

        expect(
            screen
                .getByTestId('plugin-filter-mock')
                .getAttribute('data-labels'),
        ).toEqual('Safe 0x1234…7890');
        expect(
            screen.getByTestId('plugin-component-mock').dataset.pluginid,
        ).toEqual(PluginInterfaceType.SAFE);
    });
});
