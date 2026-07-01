import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as daoService from '@/shared/api/daoService';
import {
    type IDao,
    type ILinkedAccountSummary,
    Network,
} from '@/shared/api/daoService';
import * as featureFlagsProvider from '@/shared/components/featureFlagsProvider';
import * as useDaoPluginsModule from '@/shared/hooks/useDaoPlugins';
import {
    generateDao,
    generateDaoMetrics,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { ALLOW_FLAG, ANY_ADDR } from '../../constants/permissionSentinels';
import { initialiseConditionRegistry } from '../../initConditionRegistry';
import type { IPermissionRow } from '../../types';
import { PermissionsList } from './permissionsList';

const ROOT_PERMISSION_ID =
    '0x815fe80e4b37c8582a3b773d1d7071f983eacfd56b5965db654f3087c25ada33';
const EXECUTE_PERMISSION_ID =
    '0xbf04b4486c9663d805744005c3da000eda93de6e3308a4a7a812eb565327b78d';

describe('<PermissionsList /> component', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useAllDaoPermissionsSpy = jest.spyOn(
        daoService,
        'useAllDaoPermissions',
    );
    const useDaoPluginsSpy = jest.spyOn(useDaoPluginsModule, 'useDaoPlugins');
    const useFeatureFlagsSpy = jest.spyOn(
        featureFlagsProvider,
        'useFeatureFlags',
    );

    const setFeatureFlags = (linkedAccountEnabled: boolean) => {
        useFeatureFlagsSpy.mockReturnValue({
            isEnabled: (key) => key === 'linkedAccount' && linkedAccountEnabled,
        } as ReturnType<typeof featureFlagsProvider.useFeatureFlags>);
    };

    const setDao = (dao?: Partial<IDao>) => {
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateDao(dao),
            }) as ReturnType<typeof daoService.useDao>,
        );
    };

    const setPermissions = (
        result: Partial<ReturnType<typeof daoService.useAllDaoPermissions>>,
    ) => {
        useAllDaoPermissionsSpy.mockReturnValue({
            data: [],
            isLoading: false,
            error: null,
            refetch: jest.fn(),
            ...result,
        } as ReturnType<typeof daoService.useAllDaoPermissions>);
    };

    beforeEach(() => {
        setFeatureFlags(false);
        setDao();
        setPermissions({ data: [], isLoading: false });
        useDaoPluginsSpy.mockReturnValue([]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const createTestComponent = (props?: { daoId?: string }) => (
        <GukModulesProvider>
            <PermissionsList daoId={props?.daoId ?? 'dao-test'} />
        </GukModulesProvider>
    );

    it('renders a skeleton while the permissions are loading', () => {
        setPermissions({ data: [], isLoading: true });

        render(createTestComponent());

        expect(
            screen.getByTestId('permissions-list-skeleton'),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(/permissionsList.empty.heading/),
        ).not.toBeInTheDocument();
    });

    it('renders the empty state when the account has no permissions', () => {
        setPermissions({ data: [], isLoading: false });

        render(createTestComponent());

        expect(
            screen.getByText(/permissionsList.empty.heading/),
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('permissions-list-skeleton'),
        ).not.toBeInTheDocument();
    });

    it('renders rows with resolved who, where and permission names', () => {
        const rows: IPermissionRow[] = [
            {
                permissionId: ROOT_PERMISSION_ID,
                whoAddress: ANY_ADDR,
                whereAddress: ALLOW_FLAG,
                conditionAddress: ALLOW_FLAG,
            },
            {
                permissionId: EXECUTE_PERMISSION_ID,
                whoAddress: ANY_ADDR,
                whereAddress: ALLOW_FLAG,
                conditionAddress: '0xC0Ffee254729296a45a3885639AC7E10F9d54979',
                condition: { conditionType: 'voting-power' },
            },
        ];
        setPermissions({ data: rows, isLoading: false });

        render(createTestComponent());

        expect(screen.getByText('ROOT_PERMISSION')).toBeInTheDocument();
        expect(screen.getByText('EXECUTE_PERMISSION')).toBeInTheDocument();
        expect(screen.getAllByText('Anyone').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Any Address').length).toBeGreaterThan(0);
        expect(
            screen.getByText(/permissionsList.header.condition/),
        ).toBeInTheDocument();
    });

    it('renders the collapsed CONDITION cell with the resolved label or a dash', () => {
        const rows: IPermissionRow[] = [
            {
                permissionId: ROOT_PERMISSION_ID,
                whoAddress: ANY_ADDR,
                whereAddress: ALLOW_FLAG,
                conditionAddress: ALLOW_FLAG,
            },
            {
                permissionId: EXECUTE_PERMISSION_ID,
                whoAddress: ANY_ADDR,
                whereAddress: ALLOW_FLAG,
                conditionAddress: '0xC0Ffee254729296a45a3885639AC7E10F9d54979',
                condition: { conditionType: 'voting-power' },
            },
        ];
        setPermissions({ data: rows, isLoading: false });

        render(createTestComponent());

        expect(screen.getByText('VotingPower')).toBeInTheDocument();
        expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('renders both the Details and Condition lists when a row is expanded', async () => {
        initialiseConditionRegistry();
        const user = userEvent.setup();
        const rows: IPermissionRow[] = [
            {
                permissionId: EXECUTE_PERMISSION_ID,
                whoAddress: ANY_ADDR,
                whereAddress: ALLOW_FLAG,
                conditionAddress: '0xC0Ffee254729296a45a3885639AC7E10F9d54979',
                condition: {
                    conditionType: 'voting-power',
                    token: '0x0bA45A8b5d5575935B8158a88C631E9F9C95a2e5',
                    minVotingPower: '1000000000000000000',
                },
            },
        ];
        setPermissions({ data: rows, isLoading: false });

        render(createTestComponent());

        await user.click(
            screen.getByRole('button', { name: /permissionsList.expandAll/ }),
        );

        expect(
            screen.getByText(/permissionsList.details.heading/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/permissionsList.condition.heading/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/votingPowerConditionSlot.token/),
        ).toBeInTheDocument();
        expect(screen.getByText('1000000000000000000')).toBeInTheDocument();
    });

    it('routes the condition cell to the fallback slot when expanded', async () => {
        const user = userEvent.setup();
        const rows: IPermissionRow[] = [
            {
                permissionId: ROOT_PERMISSION_ID,
                whoAddress: ANY_ADDR,
                whereAddress: ALLOW_FLAG,
                conditionAddress: ALLOW_FLAG,
            },
        ];
        setPermissions({ data: rows, isLoading: false });

        render(createTestComponent());

        await user.click(
            screen.getByRole('button', { name: /permissionsList.expandAll/ }),
        );

        expect(screen.getByText(/noConditionSlot.heading/)).toBeInTheDocument();
    });

    it('re-queries permissions with the selected linked account params on tab switch', async () => {
        const user = userEvent.setup();
        const linkedAccount: ILinkedAccountSummary = {
            id: 'linked-1',
            address: '0xLinkedAddress',
            network: Network.POLYGON_MAINNET,
            name: 'Linked Treasury',
            description: '',
            ens: null,
            subdomain: null,
            avatar: null,
            metrics: generateDaoMetrics(),
            links: [],
            blockTimestamp: 0,
            transactionHash: '',
        };
        setFeatureFlags(true);
        setDao({
            id: 'main-dao',
            address: '0xMainAddress',
            network: Network.ETHEREUM_MAINNET,
            name: 'Main DAO',
            linkedAccounts: [linkedAccount],
        });

        render(createTestComponent({ daoId: 'main-dao' }));

        expect(useAllDaoPermissionsSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({
                urlParams: {
                    network: Network.ETHEREUM_MAINNET,
                    daoAddress: '0xMainAddress',
                },
            }),
            expect.anything(),
        );

        await user.click(
            screen.getByRole('radio', { name: 'Linked Treasury' }),
        );

        expect(useAllDaoPermissionsSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({
                urlParams: {
                    network: Network.POLYGON_MAINNET,
                    daoAddress: '0xLinkedAddress',
                },
            }),
            expect.anything(),
        );
    });
});
