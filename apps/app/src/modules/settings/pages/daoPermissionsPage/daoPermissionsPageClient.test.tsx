import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as DaoService from '@/shared/api/daoService';
import { Network } from '@/shared/api/daoService';
import {
    generateDao,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import type { IUsePermissionsDataResult } from '../../hooks/usePermissionsData';
import * as UsePermissionsDataModule from '../../hooks/usePermissionsData';
import type { IPermissionRow } from '../../types';
import { DaoPermissionsPageClient } from './daoPermissionsPageClient';

jest.mock('../../components/permissionsGraph', () => ({
    PermissionsGraph: (props: { rows: IPermissionRow[] }) => (
        <div
            data-row-count={props.rows.length}
            data-testid="permissions-graph"
        />
    ),
}));

jest.mock('../../components/permissionsList', () => ({
    getPermissionRowKey: (row: IPermissionRow) =>
        `${row.permissionId}-${row.whoAddress}-${row.whereAddress}`,
    PermissionsList: (props: { rows: IPermissionRow[] }) => (
        <div
            data-row-count={props.rows.length}
            data-testid="permissions-list"
        />
    ),
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
                    'Hide permissions on governing bodies',
                'app.settings.daoPermissionsPage.filters.hideDaoPermissionsTooltipLabel':
                    'About permissions granted to DAO',
                'app.settings.daoPermissionsPage.filters.hideDaoPermissionsTooltip':
                    'Hides permissions where the selected DAO appears under Who, including DAO-managed internal contracts such as clocks.',
                'app.settings.daoPermissionsPage.filters.hideGoverningBodyPermissionsTooltipLabel':
                    'About governing body permissions',
                'app.settings.daoPermissionsPage.filters.hideGoverningBodyPermissionsTooltip':
                    'Hides permissions whose target is a governing body — a plugin nested inside another (subplugin).',
                'app.settings.daoPermissionsPage.view.graph': 'Graph',
                'app.settings.daoPermissionsPage.view.list': 'List',
                'app.settings.permissionsList.expandAll': 'Expand all',
                'app.settings.permissionsList.collapseAll': 'Collapse all',
            })[key] ?? key,
    }),
}));

const activeDaoAddress = '0x1111111111111111111111111111111111111111';
const pluginAddress = '0x2222222222222222222222222222222222222222';
const externalAddress = '0x3333333333333333333333333333333333333333';
const otherAddress = '0x4444444444444444444444444444444444444444';

const buildRow = (partial: Partial<IPermissionRow>): IPermissionRow => ({
    permissionId: 'permission-id',
    whoAddress: pluginAddress,
    whereAddress: activeDaoAddress,
    conditionAddress: '0x0000000000000000000000000000000000000000',
    ...partial,
});

describe('<DaoPermissionsPageClient /> component', () => {
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');
    const usePermissionsDataSpy = jest.spyOn(
        UsePermissionsDataModule,
        'usePermissionsData',
    );

    beforeEach(() => {
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
        usePermissionsDataSpy.mockReturnValue({
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
        } as IUsePermissionsDataResult);
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
            screen.queryByRole('button', { name: 'Granted' }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Other' }),
        ).not.toBeInTheDocument();
        expect(
            screen.getByText('Hide permissions granted to DAO'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('Hide permissions on governing bodies'),
        ).toBeInTheDocument();
        expect(screen.queryByText('DAO as caller')).not.toBeInTheDocument();
        expect(screen.queryByText('Subplugin paths')).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', {
                name: 'About permissions granted to DAO',
            }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', {
                name: 'About governing body permissions',
            }),
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('img', {
                name: /including DAO-managed internal contracts such as clocks/,
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('img', {
                name: /Hides permissions whose target is a governing body/,
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

    it('ignores stale positive show params when deriving hide defaults', () => {
        mockFilterParamValues = {
            permissionsdao: 'false',
            permissionssubplugins: 'false',
            permissionsview: 'graph',
        };

        render(
            <GukModulesProvider>
                <DaoPermissionsPageClient daoId="dao-id" />
            </GukModulesProvider>,
        );
        expect(screen.getByTestId('permissions-graph')).toHaveAttribute(
            'data-row-count',
            '2',
        );
    });

    it('ignores stale hide params from the previous preview', () => {
        mockFilterParamValues = {
            permissionshidedao: 'false',
            permissionshidegoverningbodies: 'false',
            permissionsview: 'graph',
        };

        render(
            <GukModulesProvider>
                <DaoPermissionsPageClient daoId="dao-id" />
            </GukModulesProvider>,
        );

        expect(screen.getByTestId('permissions-graph')).toHaveAttribute(
            'data-row-count',
            '2',
        );
    });
});
