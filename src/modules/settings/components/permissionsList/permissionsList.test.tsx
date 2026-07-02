import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { ALLOW_FLAG, ANY_ADDR } from '../../constants/permissionSentinels';
import { initialiseConditionRegistry } from '../../initConditionRegistry';
import type { IPermissionRow } from '../../types';
import {
    getPermissionRowKey,
    type IPermissionsListProps,
    PermissionsList,
} from './permissionsList';

const ROOT_PERMISSION_ID =
    '0x815fe80e4b37c8582a3b773d1d7071f983eacfd56b5965db654f3087c25ada33';
const EXECUTE_PERMISSION_ID =
    '0xbf04b4486c9663d805744005c3da000eda93de6e3308a4a7a812eb565327b78d';

describe('<PermissionsList /> component', () => {
    beforeAll(() => {
        initialiseConditionRegistry();
    });

    const createTestComponent = (props?: Partial<IPermissionsListProps>) => {
        const completeProps: IPermissionsListProps = {
            rows: [],
            accountRefs: [],
            daoPlugins: [],
            chainId: undefined,
            isLoading: false,
            expandedRows: [],
            onExpandedRowsChange: jest.fn(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <PermissionsList {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders a skeleton while the permissions are loading', () => {
        render(createTestComponent({ isLoading: true }));

        expect(
            screen.getByTestId('permissions-list-skeleton'),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(/permissionsList.empty.heading/),
        ).not.toBeInTheDocument();
    });

    it('renders the empty state when there are no permissions', () => {
        render(createTestComponent({ rows: [] }));

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

        render(createTestComponent({ rows }));

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

        render(createTestComponent({ rows }));

        expect(screen.getByText('VotingPower')).toBeInTheDocument();
        expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('renders both the Details and Condition lists for an expanded row', async () => {
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

        render(
            createTestComponent({
                rows,
                expandedRows: [getPermissionRowKey(rows[0])],
            }),
        );

        expect(
            screen.getByText(/permissionsList.details.heading/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/permissionsList.condition.heading/),
        ).toBeInTheDocument();
        // The condition slot is a lazy (dynamic) component — await its load.
        expect(
            await screen.findByText(/votingPowerConditionSlot.token/),
        ).toBeInTheDocument();
        // 1e18 base units formatted with the default 18 decimals.
        expect(await screen.findByText('1')).toBeInTheDocument();
    });

    it('routes the condition cell to the fallback slot for an expanded row', () => {
        const rows: IPermissionRow[] = [
            {
                permissionId: ROOT_PERMISSION_ID,
                whoAddress: ANY_ADDR,
                whereAddress: ALLOW_FLAG,
                conditionAddress: ALLOW_FLAG,
            },
        ];

        render(
            createTestComponent({
                rows,
                expandedRows: [getPermissionRowKey(rows[0])],
            }),
        );

        expect(screen.getByText(/noConditionSlot.heading/)).toBeInTheDocument();
    });
});
