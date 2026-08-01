import {
    addressUtils,
    clipboardUtils,
    GukModulesProvider,
    IconType,
} from '@aragon/gov-ui-kit';
import { fireEvent, render, screen, within } from '@testing-library/react';
import type { IDaoPermission } from '@/shared/api/daoService';
import { generateDaoPermission } from '@/shared/testUtils';
import { ALLOW_FLAG, ANY_ADDR } from '../../constants/permissionSentinels';
import { initialiseConditionRegistry } from '../../initConditionRegistry';
import {
    getPermissionRowKey,
    type IPermissionsListProps,
    PermissionsList,
} from './permissionsList';

const ROOT_PERMISSION_ID =
    '0x815fe80e4b37c8582a3b773d1d7071f983eacfd56b5965db654f3087c25ada33';
const EXECUTE_PERMISSION_ID =
    '0xbf04b4486c9663d805744005c3da000eda93de6e3308a4a7a812eb565327b78d';

const buildRow = (partial: Partial<IDaoPermission>): IDaoPermission =>
    generateDaoPermission({
        permissionId: EXECUTE_PERMISSION_ID,
        whoAddress: ANY_ADDR,
        whereAddress: ALLOW_FLAG,
        conditionAddress: ALLOW_FLAG,
        condition: undefined,
        conditionEntity: undefined,
        network: undefined,
        who: undefined,
        where: undefined,
        ...partial,
    });

describe('<PermissionsList /> component', () => {
    beforeAll(() => {
        initialiseConditionRegistry();
    });

    afterEach(() => {
        jest.restoreAllMocks();
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
        const rows: IDaoPermission[] = [
            buildRow({
                permissionId: ROOT_PERMISSION_ID,
            }),
            buildRow({
                conditionAddress: '0xC0Ffee254729296a45a3885639AC7E10F9d54979',
                condition: { conditionType: 'voting-power' },
            }),
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
        const rows: IDaoPermission[] = [
            buildRow({
                permissionId: ROOT_PERMISSION_ID,
                whoAddress: '0x2222222222222222222222222222222222222222',
                who: {
                    address: '0x2222222222222222222222222222222222222222',
                    interfaceType: 'spp',
                    label: 'Backend SPP',
                    layer: 'topLevelPlugin',
                    status: 'installed',
                },
            }),
        ];

        render(createTestComponent({ rows }));

        expect(screen.getAllByText('Backend SPP').length).toBeGreaterThan(0);
        expect(screen.getAllByText('SPP').length).toBeGreaterThan(0);
    });

    it('renders the Safe logo instead of a SAFE tag for Safe bodies', () => {
        const rows: IDaoPermission[] = [
            buildRow({
                whoAddress: '0x3333333333333333333333333333333333333333',
                who: {
                    address: '0x3333333333333333333333333333333333333333',
                    brandId: 'safe',
                    label: 'Safe',
                    layer: 'processInternal',
                },
            }),
        ];

        render(createTestComponent({ rows }));

        expect(screen.getAllByLabelText('Safe account').length).toBeGreaterThan(
            0,
        );
        expect(screen.queryByText('SAFE')).not.toBeInTheDocument();
    });

    it('renders the members icon for Anyone entities', () => {
        const rows: IDaoPermission[] = [
            buildRow({
                permissionId: ROOT_PERMISSION_ID,
            }),
        ];

        render(createTestComponent({ rows }));

        expect(screen.getAllByText('Anyone').length).toBeGreaterThan(0);
        expect(screen.getAllByLabelText('Members').length).toBeGreaterThan(0);
    });

    it('renders informational help for the Who and Where headers', () => {
        const rows: IDaoPermission[] = [
            buildRow({
                permissionId: ROOT_PERMISSION_ID,
            }),
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

    it('aligns the desktop header with the accordion row affordance', () => {
        const rows = [buildRow({ permissionId: ROOT_PERMISSION_ID })];

        render(createTestComponent({ rows }));

        const alignmentAffordance = screen
            .getAllByTestId(IconType.CHEVRON_DOWN)
            .map((icon) => icon.parentElement)
            .find((parent) => parent?.classList.contains('invisible'));

        expect(alignmentAffordance).toBeInTheDocument();
        expect(alignmentAffordance?.parentElement).toHaveClass(
            'px-4',
            'md:px-6',
        );
    });

    it('renders the collapsed condition cell with the resolved label or a dash', () => {
        const rows: IDaoPermission[] = [
            buildRow({
                permissionId: ROOT_PERMISSION_ID,
            }),
            buildRow({
                conditionAddress: '0xC0Ffee254729296a45a3885639AC7E10F9d54979',
                condition: { conditionType: 'voting-power' },
            }),
        ];

        render(createTestComponent({ rows }));

        expect(screen.getAllByText('VotingPower').length).toBeGreaterThan(0);
        expect(screen.getAllByText('-').length).toBeGreaterThan(0);
    });

    it('keys rows by condition address so distinct conditions do not collide', () => {
        const baseRow = buildRow({
            conditionAddress: '0xC0Ffee254729296a45a3885639AC7E10F9d54979',
        });
        const matchingRuleRow: IDaoPermission = {
            ...baseRow,
            conditionAddress: '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
        };

        expect(getPermissionRowKey(baseRow)).not.toEqual(
            getPermissionRowKey(matchingRuleRow),
        );
    });

    it('renders the inline card and accordion arrangements with ordered field labels', () => {
        const rows: IDaoPermission[] = [
            buildRow({
                conditionAddress: '0xC0Ffee254729296a45a3885639AC7E10F9d54979',
                condition: { conditionType: 'voting-power' },
            }),
        ];

        render(createTestComponent({ rows }));

        expect(screen.getAllByText('EXECUTE_PERMISSION')).toHaveLength(3);
        expect(screen.getAllByRole('radio')).toHaveLength(2);

        const rowHeader = screen
            .getAllByText('EXECUTE_PERMISSION')
            .map((element) => element.closest('button'))
            .find((button) => button != null);
        expect(rowHeader).not.toBeNull();
        expect(rowHeader!.closest('[class~="md:block"]')).not.toBeNull();

        const fieldLabels = [
            'app.settings.permissionsList.header.who',
            'app.settings.permissionsList.header.where',
            'app.settings.permissionsList.header.permission',
            'app.settings.permissionsList.header.condition',
        ];
        const rowText = rowHeader?.textContent ?? '';
        const positions = fieldLabels.map((label) => rowText.indexOf(label));

        expect(positions.every((position) => position >= 0)).toBe(true);
        expect(positions).toEqual([...positions].sort((a, b) => a - b));
        expect(within(rowHeader!).getByText('VotingPower')).toBeInTheDocument();
    });

    it('renders both the Details and Condition lists for an expanded row', async () => {
        const conditionAddress = '0xC0Ffee254729296a45a3885639AC7E10F9d54979';
        const rows: IDaoPermission[] = [
            buildRow({
                conditionAddress,
                condition: {
                    conditionType: 'voting-power',
                    token: '0x0bA45A8b5d5575935B8158a88C631E9F9C95a2e5',
                    minVotingPower: '1000000000000000000',
                },
            }),
        ];

        const clipboardCopySpy = jest.spyOn(clipboardUtils, 'copy');
        const { container } = render(
            createTestComponent({
                rows,
                chainId: 1,
                expandedRows: [getPermissionRowKey(rows[0])],
            }),
        );

        expect(
            screen.getAllByText(/permissionsList.details.heading/).length,
        ).toBeGreaterThan(0);
        expect(
            screen.getAllByText(/permissionsList.condition.heading/).length,
        ).toBeGreaterThan(0);
        expect(
            await screen.findByText(/votingPowerConditionSlot.token/),
        ).toBeInTheDocument();
        expect(await screen.findByText('1')).toBeInTheDocument();

        const detailTerms = screen
            .getAllByText(
                /app\.settings\.permissionsList\.details\.(who|where|permission|condition)$/,
            )
            .map((element) => element.textContent);
        expect(detailTerms).toHaveLength(8);
        expect(detailTerms.slice(0, 4)).toEqual([
            'app.settings.permissionsList.details.who',
            'app.settings.permissionsList.details.where',
            'app.settings.permissionsList.details.permission',
            'app.settings.permissionsList.details.condition',
        ]);

        const conditionLinks = screen.getAllByText(
            addressUtils.truncateAddress(conditionAddress),
        );
        expect(conditionLinks.length).toBeGreaterThan(0);
        for (const conditionValue of conditionLinks) {
            expect(conditionValue.closest('a')?.getAttribute('href')).toContain(
                `/address/${conditionAddress}`,
            );
        }

        const permissionHashes = screen.getAllByText(
            addressUtils.truncateHash(EXECUTE_PERMISSION_ID),
        );
        for (const permissionHash of permissionHashes) {
            expect(permissionHash.closest('a')).toBeNull();
        }
        screen
            .getAllByTestId(IconType.COPY)
            .forEach((copyIcon) => fireEvent.click(copyIcon));
        expect(clipboardCopySpy).toHaveBeenCalledWith(EXECUTE_PERMISSION_ID);
        expect(
            container.querySelector(`a[href*="${EXECUTE_PERMISSION_ID}"]`),
        ).toBeNull();
    });

    it('keeps the details dash as the only empty-condition state for an expanded row', () => {
        const rows: IDaoPermission[] = [
            buildRow({
                permissionId: ROOT_PERMISSION_ID,
            }),
        ];

        render(
            createTestComponent({
                rows,
                expandedRows: [getPermissionRowKey(rows[0])],
            }),
        );

        expect(
            screen.queryByTestId('no-condition-placeholder'),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(/permissionsList.condition.heading/),
        ).not.toBeInTheDocument();
        expect(screen.getAllByText('-').length).toBeGreaterThan(0);
    });

    it('renders mobile rows as inline detail cards showing the existing details list directly', () => {
        const rows: IDaoPermission[] = [
            buildRow({
                conditionAddress: '0xC0Ffee254729296a45a3885639AC7E10F9d54979',
            }),
        ];

        render(createTestComponent({ rows, chainId: 1 }));

        const detailsTerm = screen.getAllByText(
            /permissionsList.details.who/,
        )[0];
        expect(detailsTerm.closest('[class~="md:hidden"]')).not.toBeNull();

        expect(screen.getAllByText('EXECUTE_PERMISSION')).toHaveLength(3);
        expect(
            screen.queryByRole('button', {
                name: /permissionsList.details.heading/,
            }),
        ).not.toBeInTheDocument();

        fireEvent.click(
            screen.getByRole('radio', {
                name: /permissionsList.condition.heading/,
            }),
        );

        expect(
            screen.getByTestId('unrecognized-condition'),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(/permissionsList.details.who/),
        ).not.toBeInTheDocument();
    });

    it('hides the condition toggle on mobile cards when the row has no condition', () => {
        const rows: IDaoPermission[] = [
            buildRow({
                permissionId: ROOT_PERMISSION_ID,
            }),
        ];

        render(createTestComponent({ rows }));

        expect(
            screen.getAllByText(/permissionsList.details.who/).length,
        ).toBeGreaterThan(0);
        expect(screen.queryAllByRole('radio')).toHaveLength(0);
        expect(
            screen.queryByTestId('no-condition-placeholder'),
        ).not.toBeInTheDocument();
    });

    it('renders an unresolved condition detail for expanded unknown conditions', () => {
        const rows: IDaoPermission[] = [
            buildRow({
                conditionAddress: '0xC0Ffee254729296a45a3885639AC7E10F9d54979',
            }),
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

    it('renders unsupported condition payloads as unrecognized, not absent', () => {
        const rows: IDaoPermission[] = [
            buildRow({
                conditionAddress: '0xC0Ffee254729296a45a3885639AC7E10F9d54979',
                condition: { conditionType: 'merkle-claim' },
            }),
        ];

        render(
            createTestComponent({
                rows,
                expandedRows: [getPermissionRowKey(rows[0])],
            }),
        );

        expect(
            screen.getByTestId('unrecognized-condition'),
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('no-condition-placeholder'),
        ).not.toBeInTheDocument();
    });
});
