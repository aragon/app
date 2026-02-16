import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { FeatureFlagsProvider } from '@/shared/components/featureFlagsProvider';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import type { FeatureFlagSnapshot } from '@/shared/featureFlags';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import { pluginGroupFilter } from '@/shared/hooks/useDaoPlugins';
import {
    generateDaoPlugin,
    generateFilterComponentPlugin,
} from '@/shared/testUtils';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { DaoProposalList, type IDaoProposalListProps } from './daoProposalList';

interface IPluginMockProps {
    initialParams?: {
        queryParams?: {
            includeSubDaos?: boolean;
        };
    };
}

jest.mock('@/shared/components/pluginFilterComponent', () => ({
    PluginFilterComponent: (props: {
        slotId: string;
        plugins: IFilterComponentPlugin[];
    }) => (
        <div
            data-plugins={JSON.stringify(
                props.plugins.map((plugin) => ({
                    id: plugin.id,
                    includeSubDaos: (
                        plugin.props as IPluginMockProps | undefined
                    )?.initialParams?.queryParams?.includeSubDaos,
                })),
            )}
            data-slotid={props.slotId}
            data-testid="plugin-component-mock"
        />
    ),
}));

describe('<DaoProposalList /> component', () => {
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');

    afterEach(() => {
        useDaoPluginsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoProposalListProps>) => {
        const completeProps: IDaoProposalListProps = {
            initialParams: { queryParams: { daoId: 'dao-id' } },
            ...props,
        };

        return <DaoProposalList {...completeProps} />;
    };

    const createFeatureFlagsSnapshot = (
        isSubDaoEnabled: boolean,
    ): FeatureFlagSnapshot[] => [
        {
            key: 'subDao',
            name: 'SubDAO',
            description: 'Enables subDAO support',
            enabled: isSubDaoEnabled,
        },
    ];

    const renderWithFlags = (
        isSubDaoEnabled: boolean,
        component: ReactElement,
    ) =>
        render(
            <FeatureFlagsProvider
                initialSnapshot={createFeatureFlagsSnapshot(isSubDaoEnabled)}
            >
                {component}
            </FeatureFlagsProvider>,
        );

    const getRenderedPlugins = () => {
        const pluginComponent = screen.getByTestId('plugin-component-mock');

        return JSON.parse(pluginComponent.dataset.plugins ?? '[]') as Array<{
            id: string;
            includeSubDaos?: boolean;
        }>;
    };

    it('renders a plugin tab component with the process plugins and the correct slot id', () => {
        const plugins = [
            pluginGroupFilter,
            generateFilterComponentPlugin({
                id: 'token',
                meta: generateDaoPlugin(),
            }),
        ];
        useDaoPluginsSpy.mockReturnValue(plugins);
        renderWithFlags(false, createTestComponent());
        const pluginComponent = screen.getByTestId('plugin-component-mock');
        expect(pluginComponent).toBeInTheDocument();
        expect(pluginComponent.dataset.slotid).toEqual(
            GovernanceSlotId.GOVERNANCE_DAO_PROPOSAL_LIST,
        );
    });

    it('sets includeSubDaos=true only for group tab when subDao feature is enabled', () => {
        const plugins = [
            pluginGroupFilter,
            generateFilterComponentPlugin({
                id: 'token',
                meta: generateDaoPlugin({ address: '0x1' }),
            }),
        ];
        useDaoPluginsSpy.mockReturnValue(plugins);
        renderWithFlags(true, createTestComponent());

        expect(getRenderedPlugins()).toEqual([
            { id: pluginGroupFilter.id, includeSubDaos: true },
            { id: 'token', includeSubDaos: false },
        ]);
    });

    it('sets includeSubDaos=false for all tabs when subDao feature is disabled', () => {
        const plugins = [
            pluginGroupFilter,
            generateFilterComponentPlugin({
                id: 'token',
                meta: generateDaoPlugin({ address: '0x1' }),
            }),
        ];
        useDaoPluginsSpy.mockReturnValue(plugins);
        renderWithFlags(false, createTestComponent());

        expect(getRenderedPlugins()).toEqual([
            { id: pluginGroupFilter.id, includeSubDaos: false },
            { id: 'token', includeSubDaos: false },
        ]);
    });
});
