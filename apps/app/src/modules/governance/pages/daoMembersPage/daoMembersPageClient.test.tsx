import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import type * as SafeMemberPanelModule from '@/plugins/safeMultisigPlugin/components/safeMemberPanel';
import type { IUseFeaturedDelegatesPluginResult } from '@/plugins/tokenPlugin/hooks/useFeaturedDelegatesPlugin';
import * as useFeaturedDelegatesPluginHook from '@/plugins/tokenPlugin/hooks/useFeaturedDelegatesPlugin';
import * as daoService from '@/shared/api/daoService';
import {
    type IDaoPlugin,
    Network,
    PluginInterfaceType,
} from '@/shared/api/daoService';
import * as safeService from '@/shared/api/safeService';
import * as useDaoPluginsModule from '@/shared/hooks/useDaoPlugins';
import {
    generateDao,
    generateDaoPlugin,
    generateFilterComponentPlugin,
    generateReactQueryResultSuccess,
    generateSafeInfoResponse,
    ReactQueryWrapper,
} from '@/shared/testUtils';
import { PluginType } from '@/shared/types';
import { featuredDelegatesTabId } from '../../components/daoMemberList';
import { daoMemberSourceUtils } from '../../utils/daoMemberSourceUtils';
import {
    DaoMembersPageClient,
    type IDaoMembersPageClientProps,
} from './daoMembersPageClient';

jest.mock('next/navigation', () => ({
    useSearchParams: jest.fn(),
}));

jest.mock('../../components/daoMemberList', () => ({
    DaoMemberList: { Container: () => null },
    featuredDelegatesTabId: 'featured-delegates',
}));

jest.mock('@/shared/components/pluginSingleComponent', () => {
    const { SafeMemberPanel } = jest.requireActual<
        typeof SafeMemberPanelModule
    >('@/plugins/safeMultisigPlugin/components/safeMemberPanel');

    return {
        PluginSingleComponent: (props: {
            daoId: string;
            pluginAddress?: string;
            pluginId: string;
        }) =>
            props.pluginId === 'external-safe' &&
            props.pluginAddress != null ? (
                <SafeMemberPanel
                    daoId={props.daoId}
                    pluginAddress={props.pluginAddress}
                />
            ) : null,
    };
});

describe('<DaoMembersPageClient /> component', () => {
    const daoAddress = '0x1111111111111111111111111111111111111111';
    const daoId = `${Network.ETHEREUM_MAINNET}-${daoAddress}`;
    const safeAddress = '0x2222222222222222222222222222222222222222';
    const secondSafeAddress = '0x3333333333333333333333333333333333333333';
    const bodyAddress = '0x4444444444444444444444444444444444444444';
    const otherBodyAddress = '0x5555555555555555555555555555555555555555';

    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useDaoPluginsSpy = jest.spyOn(useDaoPluginsModule, 'useDaoPlugins');
    const useFeaturedDelegatesPluginSpy = jest.spyOn(
        useFeaturedDelegatesPluginHook,
        'useFeaturedDelegatesPlugin',
    );
    const useSafeInfoSpy = jest.spyOn(safeService, 'useSafeInfo');
    const useSearchParamsMock = jest.mocked(useSearchParams);

    const dao = generateDao({
        id: daoId,
        address: daoAddress,
        network: Network.ETHEREUM_MAINNET,
    });

    const createBodyPlugin = (address: string) =>
        generateDaoPlugin({
            address,
            interfaceType: PluginInterfaceType.TOKEN_VOTING,
            isBody: true,
            slug: `body-${address.slice(-4)}`,
        });

    const createBodyFilter = (plugin: IDaoPlugin, label: string) =>
        generateFilterComponentPlugin({
            id: plugin.interfaceType,
            uniqueId: `${plugin.address}-${plugin.slug}`,
            label,
            meta: plugin,
            props: {},
        });

    const createSafeProcessFilter = (address: string) => {
        const plugin = generateDaoPlugin({
            address,
            interfaceType: PluginInterfaceType.SAFE,
            isProcess: true,
            isBody: false,
        });

        return generateFilterComponentPlugin({
            id: plugin.interfaceType,
            uniqueId: `${plugin.address}-${plugin.slug}`,
            label: `Safe ${address.slice(0, 6)}`,
            meta: plugin,
            props: {},
        });
    };

    beforeEach(() => {
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: dao }),
        );
        useDaoPluginsSpy.mockReturnValue([]);
        useFeaturedDelegatesPluginSpy.mockReturnValue({
            hasFeaturedDelegates: false,
            featuredDelegatesConfig: undefined,
            featuredDelegatesPlugin: undefined,
        });
        useSafeInfoSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateSafeInfoResponse({
                    address: safeAddress,
                    nonce: '42',
                }),
            }),
        );
        useSearchParamsMock.mockReturnValue(new URLSearchParams() as never);
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useDaoPluginsSpy.mockReset();
        useFeaturedDelegatesPluginSpy.mockReset();
        useSafeInfoSpy.mockReset();
        useSearchParamsMock.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IDaoMembersPageClientProps>,
    ) => {
        const completeProps: IDaoMembersPageClientProps = {
            initialParams: {
                queryParams: {
                    daoId,
                    pluginAddress: bodyAddress,
                },
            },
            featuredDelegates: [],
            ...props,
        };

        return (
            <ReactQueryWrapper>
                <GukModulesProvider>
                    <DaoMembersPageClient {...completeProps} />
                </GukModulesProvider>
            </ReactQueryWrapper>
        );
    };

    it('shows the body selected by the featured delegates configuration', () => {
        const firstBody = createBodyPlugin(bodyAddress);
        const featuredBody = createBodyPlugin(otherBodyAddress);
        const firstBodyFilter = createBodyFilter(firstBody, 'First body');
        const featuredBodyFilter = createBodyFilter(
            featuredBody,
            'Featured body',
        );
        const featuredBodyFilters = [firstBodyFilter, featuredBodyFilter];

        useDaoPluginsSpy.mockImplementation((params) => {
            if (params.pluginAddress != null) {
                return featuredBodyFilters.filter(
                    ({ meta }) => meta.address === params.pluginAddress,
                );
            }

            return params.type === PluginType.BODY ? featuredBodyFilters : [];
        });
        useFeaturedDelegatesPluginSpy.mockReturnValue({
            hasFeaturedDelegates: true,
            featuredDelegatesConfig: {
                daoAddress,
                pluginAddress: featuredBody.address,
                network: Network.ETHEREUM_MAINNET,
                delegates: [safeAddress],
            },
            featuredDelegatesPlugin:
                featuredBody as unknown as (IUseFeaturedDelegatesPluginResult & {
                    hasFeaturedDelegates: true;
                })['featuredDelegatesPlugin'],
        });
        useSearchParamsMock.mockReturnValue(
            new URLSearchParams({ members: featuredDelegatesTabId }) as never,
        );

        render(createTestComponent());

        expect(
            screen.getByRole('heading', { name: 'Featured body' }),
        ).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /0x5555/ })).toHaveAttribute(
            'href',
            `https://etherscan.io/address/${featuredBody.address}`,
        );
        expect(
            screen.queryByRole('link', { name: /0x4444/ }),
        ).not.toBeInTheDocument();
    });

    it('shows Safe configuration for the default sole native Safe source', () => {
        const safeProcessFilter = createSafeProcessFilter(safeAddress);

        useDaoPluginsSpy.mockImplementation((params) => {
            if (params.pluginAddress != null) {
                return [];
            }

            return params.type === PluginType.PROCESS
                ? [safeProcessFilter]
                : [];
        });

        render(createTestComponent());

        expect(screen.getByText('42')).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute(
            'href',
            expect.stringContaining(
                '0x2222222222222222222222222222222222222222',
            ),
        );
    });

    it('shows the explicitly selected Safe source', () => {
        const firstSafeFilter = createSafeProcessFilter(safeAddress);
        const selectedSafeFilter = createSafeProcessFilter(secondSafeAddress);
        const selectedSafeSourceId = daoMemberSourceUtils.getSafeSourceId(
            daoId,
            secondSafeAddress,
        );

        useDaoPluginsSpy.mockImplementation((params) => {
            if (params.pluginAddress != null) {
                return [];
            }

            return params.type === PluginType.PROCESS
                ? [firstSafeFilter, selectedSafeFilter]
                : [];
        });
        useSafeInfoSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateSafeInfoResponse({ address: secondSafeAddress }),
            }),
        );
        useSearchParamsMock.mockReturnValue(
            new URLSearchParams({ members: selectedSafeSourceId }) as never,
        );

        render(createTestComponent());

        expect(screen.getByRole('link')).toHaveAttribute(
            'href',
            expect.stringContaining(
                '0x3333333333333333333333333333333333333333',
            ),
        );
        expect(
            screen.queryByRole('link', { name: /0x2222/ }),
        ).not.toBeInTheDocument();
    });
});
