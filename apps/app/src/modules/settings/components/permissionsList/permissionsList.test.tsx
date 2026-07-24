import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen, within } from '@testing-library/react';
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
const SET_TRUSTED_FORWARDER_PERMISSION_ID =
    '0x06d294bc8cbad2e393408b20dd019a772661f60b8d633e56761157cb1ec85f8c';

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

    const getMobileList = (container: HTMLElement) => {
        const mobileList = container.querySelector<HTMLElement>(
            '[class~="md:hidden"]',
        );

        if (mobileList == null) {
            throw new Error('Mobile permissions list not found');
        }

        return mobileList;
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

        expect(screen.getAllByText('ROOT_PERMISSION').length).toBeGreaterThan(
            0,
        );
        expect(
            screen.getAllByText('EXECUTE_PERMISSION').length,
        ).toBeGreaterThan(0);
        expect(screen.getAllByText('Anyone').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Any Address').length).toBeGreaterThan(0);
        expect(
            screen.getAllByText(/permissionsList.header.condition/).length,
        ).toBeGreaterThan(0);
    });

    it('renders the collapsed condition cell with the resolved label or a dash', () => {
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

        expect(screen.getAllByText('VotingPower').length).toBeGreaterThan(0);
        expect(screen.getAllByText('-').length).toBeGreaterThan(0);
    });

    it('keys rows by condition address so distinct conditions do not collide', () => {
        const baseRow: IPermissionRow = {
            permissionId: EXECUTE_PERMISSION_ID,
            whoAddress: ANY_ADDR,
            whereAddress: ALLOW_FLAG,
            conditionAddress: '0xC0Ffee254729296a45a3885639AC7E10F9d54979',
        };
        const matchingRuleRow: IPermissionRow = {
            ...baseRow,
            conditionAddress: '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
        };

        expect(getPermissionRowKey(baseRow)).not.toEqual(
            getPermissionRowKey(matchingRuleRow),
        );
    });

    it('renders unresolved condition labels explicitly', () => {
        const rows: IPermissionRow[] = [
            {
                permissionId: EXECUTE_PERMISSION_ID,
                whoAddress: ANY_ADDR,
                whereAddress: ALLOW_FLAG,
                conditionAddress: '0xC0Ffee254729296a45a3885639AC7E10F9d54979',
            },
        ];

        render(createTestComponent({ rows }));

        expect(
            screen.getAllByText('Unrecognized condition').length,
        ).toBeGreaterThan(0);
    });

    it('renders mobile cards as static content without accordion controls', () => {
        const rows: IPermissionRow[] = [
            {
                permissionId: SET_TRUSTED_FORWARDER_PERMISSION_ID,
                whoAddress: ANY_ADDR,
                whereAddress: ALLOW_FLAG,
                conditionAddress: ALLOW_FLAG,
            },
        ];

        const { container } = render(createTestComponent({ rows }));
        const mobileList = getMobileList(container);

        expect(
            within(mobileList).getByText(/permissionsList.header.permission/),
        ).toBeInTheDocument();
        expect(
            within(mobileList).getByText('SET_TRUSTED_FORWARDER_PERMISSION'),
        ).toHaveClass('truncate');
        expect(within(mobileList).getByText('-')).toBeInTheDocument();
        expect(
            within(mobileList).queryByRole('button'),
        ).not.toBeInTheDocument();
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
        expect(
            await screen.findByText(/votingPowerConditionSlot.token/),
        ).toBeInTheDocument();
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

        expect(
            screen.getByTestId('no-condition-placeholder'),
        ).toHaveTextContent('-');
    });

    it('does not render an explicit no-condition detail label', () => {
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

        expect(
            screen.queryByText(/permissionsList.details.noCondition/),
        ).not.toBeInTheDocument();
        expect(
            screen.getByTestId('no-condition-placeholder'),
        ).toHaveTextContent('-');
    });

    it('renders an unresolved condition detail for expanded unknown conditions', () => {
        const rows: IPermissionRow[] = [
            {
                permissionId: EXECUTE_PERMISSION_ID,
                whoAddress: ANY_ADDR,
                whereAddress: ALLOW_FLAG,
                conditionAddress: '0xC0Ffee254729296a45a3885639AC7E10F9d54979',
            },
        ];

        render(
            createTestComponent({
                rows,
                expandedRows: [getPermissionRowKey(rows[0])],
            }),
        );

        expect(
            screen.getAllByText('Unrecognized condition').length,
        ).toBeGreaterThanOrEqual(2);
        expect(screen.queryByText(/noConditionSlot/)).not.toBeInTheDocument();
    });
});
