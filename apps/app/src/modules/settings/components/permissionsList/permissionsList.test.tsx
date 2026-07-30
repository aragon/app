import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { generateDaoPlugin } from '@/shared/testUtils';
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
const SPP_PLUGIN_ADDRESS = '0x26A696269116cAaB99626Cc793CeA24bbCec7528';

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

    it('renders backend-enriched entity labels without plugin lookup', () => {
        const rows: IPermissionRow[] = [
            {
                permissionId: ROOT_PERMISSION_ID,
                whoAddress: '0x2222222222222222222222222222222222222222',
                whereAddress: ALLOW_FLAG,
                conditionAddress: ALLOW_FLAG,
                who: {
                    address: '0x2222222222222222222222222222222222222222',
                    interfaceType: 'spp',
                    label: 'Backend SPP',
                    layer: 'topLevelPlugin',
                    status: 'installed',
                },
            },
        ];

        render(createTestComponent({ rows }));

        expect(screen.getAllByText('Backend SPP').length).toBeGreaterThan(0);
        expect(screen.getAllByText('SPP').length).toBeGreaterThan(0);
    });

    it('renders the Safe logo instead of a SAFE tag for Safe bodies', () => {
        const rows: IPermissionRow[] = [
            {
                permissionId: EXECUTE_PERMISSION_ID,
                whoAddress: '0x3333333333333333333333333333333333333333',
                whereAddress: ALLOW_FLAG,
                conditionAddress: ALLOW_FLAG,
                who: {
                    address: '0x3333333333333333333333333333333333333333',
                    brandId: 'safe',
                    label: 'Safe',
                    layer: 'processInternal',
                },
            },
        ];

        render(createTestComponent({ rows }));

        expect(screen.getAllByLabelText('Safe account').length).toBeGreaterThan(
            0,
        );
        expect(screen.queryByText('SAFE')).not.toBeInTheDocument();
    });

    it('renders the members icon for Anyone entities', () => {
        const rows: IPermissionRow[] = [
            {
                permissionId: ROOT_PERMISSION_ID,
                whoAddress: ANY_ADDR,
                whereAddress: ALLOW_FLAG,
                conditionAddress: ALLOW_FLAG,
            },
        ];

        render(createTestComponent({ rows }));

        expect(screen.getAllByText('Anyone').length).toBeGreaterThan(0);
        expect(screen.getAllByLabelText('Members').length).toBeGreaterThan(0);
    });

    it('renders informational help for the Who and Where headers', () => {
        const rows: IPermissionRow[] = [
            {
                permissionId: ROOT_PERMISSION_ID,
                whoAddress: ANY_ADDR,
                whereAddress: ALLOW_FLAG,
                conditionAddress: ALLOW_FLAG,
            },
        ];

        render(createTestComponent({ rows }));

        expect(
            screen.getByRole('img', {
                name: /permissionsList.header.whoTooltip/,
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('img', {
                name: /permissionsList.header.whereTooltip/,
            }),
        ).toBeInTheDocument();
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

        const conditionLabels = screen.getAllByText('Unrecognized condition');
        expect(conditionLabels.length).toBeGreaterThan(0);
        expect(conditionLabels[0].parentElement).toHaveClass(
            'max-w-full',
            '[&>p]:truncate',
        );
    });

    it('renders mobile cards with graph-style chrome and hides toggles without a condition', () => {
        const rows: IPermissionRow[] = [
            {
                permissionId: SET_TRUSTED_FORWARDER_PERMISSION_ID,
                whoAddress: ANY_ADDR,
                whereAddress: SPP_PLUGIN_ADDRESS,
                conditionAddress: ALLOW_FLAG,
            },
        ];

        const { container } = render(
            createTestComponent({
                rows,
                daoPlugins: [
                    {
                        id: 'spp',
                        uniqueId: 'spp-1',
                        label: 'Polling',
                        meta: generateDaoPlugin({
                            name: 'Polling',
                            address: SPP_PLUGIN_ADDRESS,
                            interfaceType: PluginInterfaceType.SPP,
                        }),
                        props: {},
                    },
                ],
            }),
        );
        const mobileList = getMobileList(container);

        expect(
            within(mobileList).getAllByText('SET_TRUSTED_FORWARDER_PERMISSION')
                .length,
        ).toBeGreaterThanOrEqual(2);
        expect(
            within(mobileList).queryByRole('radio', {
                name: /permissionsList.details.permission/,
            }),
        ).not.toBeInTheDocument();
        expect(
            within(mobileList).queryByRole('radio', {
                name: /permissionsList.details.condition/,
            }),
        ).not.toBeInTheDocument();
        expect(
            within(mobileList).getAllByText('Anyone').length,
        ).toBeGreaterThan(0);
        expect(within(mobileList).getByText('Polling')).toBeInTheDocument();
    });

    it('switches mobile cards from permission details to condition details', () => {
        const rows: IPermissionRow[] = [
            {
                permissionId: EXECUTE_PERMISSION_ID,
                whoAddress: ANY_ADDR,
                whereAddress: ALLOW_FLAG,
                conditionAddress: '0xC0Ffee254729296a45a3885639AC7E10F9d54979',
            },
        ];

        const { container } = render(createTestComponent({ rows }));
        const mobileList = getMobileList(container);

        fireEvent.click(
            within(mobileList).getByRole('radio', {
                name: /permissionsList.details.condition/,
            }),
        );

        expect(
            within(mobileList).getByText(/unrecognizedConditionSlot.heading/),
        ).toBeInTheDocument();
    });

    it('renders the graph-popout condition summary on conditioned mobile cards', () => {
        const rows: IPermissionRow[] = [
            {
                permissionId: EXECUTE_PERMISSION_ID,
                whoAddress: ANY_ADDR,
                whereAddress: ALLOW_FLAG,
                conditionAddress: '0xC0Ffee254729296a45a3885639AC7E10F9d54979',
            },
        ];

        const { container } = render(createTestComponent({ rows }));
        const mobileList = getMobileList(container);

        expect(
            within(mobileList).getByText(
                /daoPermissionsPage\.graphView\.edge\.condition/,
            ),
        ).toBeInTheDocument();
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
            screen.getAllByText(/permissionsList.details.heading/).length,
        ).toBeGreaterThan(0);
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
