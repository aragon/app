import { render, screen } from '@testing-library/react';
import type { ISppPluginSettings } from '@/plugins/sppPlugin/types';
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
import { PluginType } from '@/shared/types';
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

    it('adds Safe bodies from SPP stages to the member tabs', () => {
        const bodyPlugin = generateDaoPlugin({
            interfaceType: PluginInterfaceType.TOKEN_VOTING,
            isBody: true,
        });
        const safeAddress = '0x1234567890123456789012345678901234567890';
        const secondSafeAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
        const sppPlugin = generateDaoPlugin<ISppPluginSettings>({
            interfaceType: PluginInterfaceType.SPP,
            isProcess: true,
            settings: {
                pluginAddress: '0xspp',
                stages: [
                    {
                        stageIndex: 0,
                        plugins: [
                            {
                                address: safeAddress,
                                interfaceType: undefined,
                                brandId: 'safe',
                                proposalType: 1,
                            },
                            {
                                address: secondSafeAddress,
                                interfaceType: undefined,
                                brandId: 'safe',
                                proposalType: 1,
                            },
                        ],
                        voteDuration: 1,
                        maxAdvance: 1,
                        minAdvance: 0,
                        approvalThreshold: 1,
                        vetoThreshold: 0,
                    },
                ],
            },
        });
        const bodyFilter = generateFilterComponentPlugin({
            meta: bodyPlugin,
        });
        const processFilter = generateFilterComponentPlugin({
            meta: sppPlugin,
        });
        useDaoPluginsSpy.mockImplementation((params) =>
            params.type === PluginType.BODY ? [bodyFilter] : [processFilter],
        );

        render(createTestComponent());

        const labels = screen
            .getByTestId('plugin-filter-mock')
            .getAttribute('data-labels')
            ?.split(',');

        expect(labels).toEqual(
            expect.arrayContaining(['Safe 0x1234…7890', 'Safe 0xabcd…abcd']),
        );
    });
});
