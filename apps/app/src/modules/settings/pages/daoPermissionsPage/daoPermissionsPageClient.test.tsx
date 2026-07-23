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

jest.mock('@/shared/hooks/useFilterUrlParam', () => ({
    useFilterUrlParam: ({
        name,
        fallbackValue,
    }: {
        name: string;
        fallbackValue: string;
    }) => {
        const valueByParam: Record<string, string> = {
            permissionsview: 'graph',
            permissionsdao: 'true',
            permissionssubplugins: 'true',
        };

        return [valueByParam[name] ?? fallbackValue, jest.fn()];
    },
}));

jest.mock('@/shared/components/translationsProvider', () => ({
    useTranslations: () => ({
        t: (key: string) =>
            ({
                'app.settings.daoPermissionsPage.filters.showDaoPermissions':
                    'Show DAO-granted permissions',
                'app.settings.daoPermissionsPage.filters.showSubpluginPermissions':
                    'Show subplugin/residual permissions',
                'app.settings.daoPermissionsPage.filters.showDaoPermissionsTooltipLabel':
                    'About DAO-granted permissions',
                'app.settings.daoPermissionsPage.filters.showDaoPermissionsTooltip':
                    'Permissions where the selected DAO appears under Who, meaning it can call another contract.',
                'app.settings.daoPermissionsPage.filters.showSubpluginPermissionsTooltipLabel':
                    'About subplugin/residual permissions',
                'app.settings.daoPermissionsPage.filters.showSubpluginPermissionsTooltip':
                    'Permissions involving a subplugin or a contract outside the selected DAO.',
                'app.settings.daoPermissionsPage.view.graph': 'Graph',
                'app.settings.daoPermissionsPage.view.list': 'List',
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
                whereAddress: externalAddress,
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
            screen.getByText('Show DAO-granted permissions'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('Show subplugin/residual permissions'),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', {
                name: 'About DAO-granted permissions',
            }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', {
                name: 'About subplugin/residual permissions',
            }),
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('img', {
                name: /Permissions where the selected DAO appears under Who/,
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('img', {
                name: /Permissions involving a subplugin/,
            }),
        ).toBeInTheDocument();
        expect(screen.getByTestId('permissions-graph')).toHaveAttribute(
            'data-row-count',
            '3',
        );
    });
});
