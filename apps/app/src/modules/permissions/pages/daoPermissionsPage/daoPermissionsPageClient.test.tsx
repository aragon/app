import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import type { IUsePermissionsDataResult } from '@/modules/settings/hooks/usePermissionsData';
import * as UsePermissionsDataModule from '@/modules/settings/hooks/usePermissionsData';
import * as DaoService from '@/shared/api/daoService';
import { type IDaoPermission, Network } from '@/shared/api/daoService';
import {
    generateDao,
    generateDaoPermission,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { DaoPermissionsPageClient } from './daoPermissionsPageClient';

let mockGraphRows: IDaoPermission[] | undefined;
let mockListRows: IDaoPermission[] | undefined;

jest.mock('@/modules/settings/components/permissionsGraph', () => ({
    PermissionsGraph: (props: { rows: IDaoPermission[] }) => {
        mockGraphRows = props.rows;

        return (
            <div
                data-row-count={props.rows.length}
                data-testid="permissions-graph"
            />
        );
    },
}));

jest.mock('@/modules/settings/components/permissionsList', () => ({
    getPermissionRowKey: (row: IDaoPermission) =>
        `${row.permissionId}-${row.whoAddress}-${row.whereAddress}`,
    PermissionsList: (props: { rows: IDaoPermission[] }) => {
        mockListRows = props.rows;

        return (
            <div
                data-row-count={props.rows.length}
                data-testid="permissions-list"
            />
        );
    },
}));

let mockFilterParamValues: Record<string, string>;

jest.mock('@/shared/hooks/useFilterUrlParam', () => ({
    useFilterUrlParam: ({
        name,
        fallbackValue,
    }: {
        name: string;
        fallbackValue: string;
    }) => [mockFilterParamValues[name] ?? fallbackValue, jest.fn()] as const,
}));

jest.mock('@/shared/components/translationsProvider', () => ({
    useTranslations: () => ({
        t: (key: string) =>
            ({
                'app.settings.daoPermissionsPage.filters.hideDaoPermissions':
                    'Hide permissions granted to DAO',
                'app.settings.daoPermissionsPage.filters.hideGoverningBodyPermissions':
                    'Hide subplugin permissions',
                'app.settings.daoPermissionsPage.filters.hideDaoPermissionsTooltipLabel':
                    'About permissions granted to DAO',
                'app.settings.daoPermissionsPage.filters.hideDaoPermissionsTooltip':
                    'Hides permissions where the selected DAO appears under Who, including DAO-managed internal contracts such as clocks.',
                'app.settings.daoPermissionsPage.filters.hideGoverningBodyPermissionsTooltipLabel':
                    'About subplugin permissions',
                'app.settings.daoPermissionsPage.filters.hideGoverningBodyPermissionsTooltip':
                    'Hides permissions where either Who or Where is identified as a subplugin.',
                'app.settings.daoPermissionsPage.view.graph': 'Graph',
                'app.settings.daoPermissionsPage.view.list': 'List',
                'app.settings.permissionsList.expandAll': 'Expand all',
                'app.settings.permissionsList.collapseAll': 'Collapse all',
            })[key] ?? key,
    }),
    useSafeTranslations: () => ({ t: (key: string) => key }),
}));

const activeDaoAddress = '0x1111111111111111111111111111111111111111';
const pluginAddress = '0x2222222222222222222222222222222222222222';
const externalAddress = '0x3333333333333333333333333333333333333333';
const otherAddress = '0x4444444444444444444444444444444444444444';

const buildRow = (partial: Partial<IDaoPermission>): IDaoPermission =>
    generateDaoPermission({
        permissionId: 'permission-id',
        whoAddress: pluginAddress,
        whereAddress: activeDaoAddress,
        conditionAddress: '0x0000000000000000000000000000000000000000',
        condition: undefined,
        conditionEntity: undefined,
        network: undefined,
        who: undefined,
        where: undefined,
        ...partial,
    });

describe('<DaoPermissionsPageClient /> component', () => {
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');
    const usePermissionsDataSpy = jest.spyOn(
        UsePermissionsDataModule,
        'usePermissionsData',
    );
    let permissionsData: IUsePermissionsDataResult;

    beforeEach(() => {
        mockGraphRows = undefined;
        mockListRows = undefined;
        mockFilterParamValues = { permissionsview: 'graph' };

        const dao = generateDao({
            address: activeDaoAddress,
            id: 'dao-id',
            network: Network.ETHEREUM_MAINNET,
            name: 'Test DAO',
        });
        const rows = [
            buildRow({
                whoAddress: pluginAddress,
                whereAddress: activeDaoAddress,
            }),
            buildRow({
                whoAddress: activeDaoAddress,
                whereAddress: externalAddress,
            }),
            buildRow({
                whoAddress: otherAddress,
                whereAddress: pluginAddress,
            }),
        ];

        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: dao }),
        );
        permissionsData = {
            dao,
            accounts: [
                {
                    id: dao.id,
                    name: dao.name,
                    network: dao.network,
                    daoAddress: dao.address,
                    avatarSrc: undefined,
                },
            ],
            activeAccountId: dao.id,
            activeAccount: {
                id: dao.id,
                name: dao.name,
                network: dao.network,
                daoAddress: dao.address,
                avatarSrc: undefined,
            },
            setSelectedAccountId: jest.fn(),
            accountRefs: [],
            daoPlugins: [],
            rows,
            chainId: 1,
            isLoading: false,
            error: null,
        } as IUsePermissionsDataResult;
        usePermissionsDataSpy.mockImplementation(() => permissionsData);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the graph as one screen controlled only by switches', () => {
        render(
            <GukModulesProvider>
                <DaoPermissionsPageClient daoId="dao-id" />
            </GukModulesProvider>,
        );
        expect(
            screen.queryByRole('link', {
                name: /app.application.navigationDao.link.dashboard/,
            }),
        ).not.toBeInTheDocument();

        expect(
            screen.queryByRole('button', { name: 'Granted' }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Other' }),
        ).not.toBeInTheDocument();
        expect(
            screen.getByText('Hide permissions granted to DAO'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('Hide subplugin permissions'),
        ).toBeInTheDocument();
        expect(screen.queryByText('DAO as caller')).not.toBeInTheDocument();
        expect(screen.queryByText('Subplugin paths')).not.toBeInTheDocument();
        expect(useDaoSpy).not.toHaveBeenCalled();
        expect(
            screen.queryByRole('button', {
                name: 'About permissions granted to DAO',
            }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', {
                name: 'About subplugin permissions',
            }),
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('img', {
                name: /including DAO-managed internal contracts such as clocks/,
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('img', {
                name: /either Who or Where is identified as a subplugin/,
            }),
        ).toBeInTheDocument();
        expect(screen.getByTestId('permissions-graph')).toHaveAttribute(
            'data-row-count',
            '2',
        );
    });

    it('hides the list expand control below the desktop breakpoint', () => {
        mockFilterParamValues = { permissionsview: 'list' };

        render(
            <GukModulesProvider>
                <DaoPermissionsPageClient daoId="dao-id" />
            </GukModulesProvider>,
        );

        expect(screen.getByRole('button', { name: 'Expand all' })).toHaveClass(
            'hidden',
            'md:inline-flex',
        );
    });

    it('shows noisy permission groups when hide switches are off', () => {
        mockFilterParamValues = {
            permissionshidedaogrants: 'false',
            permissionshidegoverningbodypaths: 'false',
            permissionsview: 'graph',
        };

        render(
            <GukModulesProvider>
                <DaoPermissionsPageClient daoId="dao-id" />
            </GukModulesProvider>,
        );

        expect(screen.getByTestId('permissions-graph')).toHaveAttribute(
            'data-row-count',
            '3',
        );
    });

    it('passes the same filtered row array from list view to graph view', () => {
        mockFilterParamValues = {
            permissionshidedaogrants: 'false',
            permissionshidegoverningbodypaths: 'false',
            permissionsview: 'list',
        };
        const createComponent = () => (
            <GukModulesProvider>
                <DaoPermissionsPageClient daoId="dao-id" />
            </GukModulesProvider>
        );
        const { rerender } = render(createComponent());
        const listRows = mockListRows;

        expect(listRows).toHaveLength(permissionsData.rows.length);
        listRows?.forEach((row, index) => {
            expect(row).toBe(permissionsData.rows[index]);
        });

        mockFilterParamValues.permissionsview = 'graph';
        rerender(createComponent());

        expect(mockGraphRows).toBe(listRows);
    });

    it('renders the shared error surface instead of an empty permissions view', () => {
        permissionsData = {
            ...permissionsData,
            error: new Error('permissions unavailable'),
            rows: [],
        } as IUsePermissionsDataResult;

        render(
            <GukModulesProvider>
                <DaoPermissionsPageClient daoId="dao-id" />
            </GukModulesProvider>,
        );

        expect(
            screen.getByText('app.shared.errorFeedback.title'),
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('permissions-graph'),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('permissions-list'),
        ).not.toBeInTheDocument();
    });

    it('keeps a successful empty result in the normal permissions view', () => {
        mockFilterParamValues = { permissionsview: 'list' };
        permissionsData = {
            ...permissionsData,
            rows: [],
        } as IUsePermissionsDataResult;

        render(
            <GukModulesProvider>
                <DaoPermissionsPageClient daoId="dao-id" />
            </GukModulesProvider>,
        );

        expect(screen.getByTestId('permissions-list')).toHaveAttribute(
            'data-row-count',
            '0',
        );
        expect(
            screen.queryByText('app.shared.errorFeedback.title'),
        ).not.toBeInTheDocument();
    });

    // Predicate semantics live in getPermissionRowToggleAvailability's own suite; these three
    // cases only prove the page wires availability (and loading) into the switches.
    it.each([
        {
            name: 'an available control',
            rows: [
                buildRow({
                    whoAddress: activeDaoAddress,
                    whereAddress: externalAddress,
                }),
            ],
            daoDisabled: false,
            subpluginDisabled: true,
            isLoading: false,
        },
        {
            name: 'no affected rows',
            rows: [buildRow({ whereAddress: activeDaoAddress })],
            daoDisabled: true,
            subpluginDisabled: true,
            isLoading: false,
        },
        {
            name: 'loading data',
            rows: [
                buildRow({
                    whoAddress: activeDaoAddress,
                    whereAddress: externalAddress,
                }),
            ],
            daoDisabled: true,
            subpluginDisabled: true,
            isLoading: true,
        },
    ])(
        'wires toggle availability into the switches for $name',
        ({ rows, daoDisabled, subpluginDisabled, isLoading }) => {
            mockFilterParamValues = {
                permissionsview: 'graph',
            };
            permissionsData = {
                ...permissionsData,
                isLoading,
                rows,
            } as IUsePermissionsDataResult;

            render(
                <GukModulesProvider>
                    <DaoPermissionsPageClient daoId="dao-id" />
                </GukModulesProvider>,
            );

            const daoSwitch = screen.getByRole('switch', {
                name: 'Hide permissions granted to DAO',
            });
            const subpluginSwitch = screen.getByRole('switch', {
                name: 'Hide subplugin permissions',
            });

            expect(daoSwitch).toHaveProperty('disabled', daoDisabled);
            expect(subpluginSwitch).toHaveProperty(
                'disabled',
                subpluginDisabled,
            );
        },
    );
});
