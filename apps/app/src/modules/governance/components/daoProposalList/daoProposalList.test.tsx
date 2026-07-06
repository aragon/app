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
            includeLinkedAccounts?: boolean;
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
                    includeLinkedAccounts: (
                        plugin.props as IPluginMockProps | undefined
                    )?.initialParams?.queryParams?.includeLinkedAccounts,
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
        isLinkedAccountEnabled: boolean,
    ): FeatureFlagSnapshot[] => [
        {
            key: 'linkedAccount',
            name: 'Linked account',
            description: 'Enables linked account support',
            enabled: isLinkedAccountEnabled,
        },
    ];

    const renderWithFlags = (
        isLinkedAccountEnabled: boolean,
        component: ReactElement,
    ) =>
        render(
            <FeatureFlagsProvider
                initialSnapshot={createFeatureFlagsSnapshot(
                    isLinkedAccountEnabled,
                )}
            >
                {component}
            </FeatureFlagsProvider>,
        );

    const getRenderedPlugins = () => {
        const pluginComponent = screen.getByTestId('plugin-component-mock');

        return JSON.parse(pluginComponent.dataset.plugins ?? '[]') as Array<{
            id: string;
            includeLinkedAccounts?: boolean;
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

    it('sets includeLinkedAccounts=true only for group tab when linkedAccount feature is enabled', () => {
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
            { id: pluginGroupFilter.id, includeLinkedAccounts: true },
            { id: 'token', includeLinkedAccounts: false },
        ]);
    });

    it('sets includeLinkedAccounts=false for all tabs when linkedAccount feature is disabled', () => {
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
            { id: pluginGroupFilter.id, includeLinkedAccounts: false },
            { id: 'token', includeLinkedAccounts: false },
        ]);
    });
});
