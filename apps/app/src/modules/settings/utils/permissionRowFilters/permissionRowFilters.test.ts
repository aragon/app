import type { IDaoPermission, IDaoPlugin } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import {
    generateDaoPermission,
    generateFilterComponentPlugin,
} from '@/shared/testUtils/generators';
import { ALLOW_FLAG, ANY_ADDR } from '../../constants/permissionSentinels';
import {
    filterPermissionRows,
    getPermissionRowToggleAvailability,
    type IPermissionRowFilters,
} from './permissionRowFilters';

const daoAddress = '0x1111111111111111111111111111111111111111';
const pluginAddress = '0x2222222222222222222222222222222222222222';
const subpluginAddress = '0x3333333333333333333333333333333333333333';
const targetAddress = '0x4444444444444444444444444444444444444444';
const parentPluginAddress = '0x5555555555555555555555555555555555555555';
const unknownPermissionId =
    '0x440d025ee487c9fe654894f3750aeb18132e334d52d7a9c0a3f6a5c77450a9b5';
const createProposalPermissionId =
    '0x8c433a4cd6b51969eca37f974940894297b9fcf4b282a213fea5cd8f85289c90';

const buildRow = (partial: Partial<IDaoPermission>): IDaoPermission => ({
    ...generateDaoPermission({
        conditionAddress: '0x0000000000000000000000000000000000000002',
        permissionId: 'permission-id',
        whereAddress: targetAddress,
        whoAddress: pluginAddress,
    }),
    ...partial,
});

const buildPlugin = (
    meta: Partial<IDaoPlugin>,
): IFilterComponentPlugin<IDaoPlugin> =>
    generateFilterComponentPlugin<IDaoPlugin, object>({
        meta: {
            address: pluginAddress,
            interfaceType: 'unknown',
            release: '0',
            build: '0',
            isProcess: false,
            isBody: false,
            isSubPlugin: false,
            settings: {},
            blockTimestamp: 0,
            transactionHash: '0x0',
            slug: 'plugin',
            ...meta,
        } as IDaoPlugin,
    });

const subpluginWhere = {
    address: subpluginAddress,
    label: 'Subplugin process',
    layer: 'processInternal',
    parentPluginAddress,
} as const;

const defaultFilters: IPermissionRowFilters = {
    activeAccountAddress: daoAddress,
    daoPlugins: [],
    showDaoPermissions: true,
    showSubpluginPermissions: false,
};

interface IFilterCase {
    name: string;
    rows: IDaoPermission[];
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[];
    filters?: Partial<IPermissionRowFilters>;
}

describe('filterPermissionRows', () => {
    // The `keeps` table is the FLT-1 / FLT-2 / FLT-3 reintroduction guard: every case is a row
    // class that the deleted heuristics (isResidualPermission, unresolved-layer checks,
    // rowHasUnresolvedPermission, the create-proposal name carve-out, and the inactive-plugin
    // pre-filter) used to hide silently. Rows may be hidden only by the two explicit toggles.
    it.each<IFilterCase>([
        {
            name: 'DAO-granted permissions when enabled',
            rows: [buildRow({ whoAddress: daoAddress })],
            filters: { showSubpluginPermissions: true },
        },
        {
            name: 'rows whose caller is a subplugin when the target is not',
            rows: [
                buildRow({
                    whoAddress: subpluginAddress,
                    who: subpluginWhere,
                    whereAddress: pluginAddress,
                }),
            ],
            daoPlugins: [
                buildPlugin({
                    address: subpluginAddress,
                    isSubPlugin: true,
                    parentPlugin: parentPluginAddress,
                }),
            ],
        },
        {
            name: 'top-level process body proposal permissions by default',
            rows: [
                buildRow({
                    where: {
                        address: targetAddress,
                        label: 'Stage 1 proposal processor',
                        layer: 'processInternal',
                        parentPluginName: 'Core Governance',
                    },
                    whereAddress: targetAddress,
                }),
                buildRow({ whereAddress: daoAddress }),
            ],
        },
        {
            name: 'ALLOW_FLAG rows when the backend sends a condition entity',
            rows: [
                buildRow({
                    conditionAddress: ALLOW_FLAG,
                    conditionEntity: {
                        address: ALLOW_FLAG,
                        label: 'Allow flag',
                        layer: 'condition',
                    },
                    whereAddress: daoAddress,
                }),
            ],
        },
        {
            name: 'real condition-contract rows when endpoints are primary entities',
            rows: [
                buildRow({
                    conditionAddress:
                        '0x6666666666666666666666666666666666666666',
                    conditionEntity: {
                        address: '0x6666666666666666666666666666666666666666',
                        label: 'Condition contract',
                        layer: 'condition',
                        status: 'installed',
                    },
                    whereAddress: daoAddress,
                }),
            ],
        },
        {
            name: 'rows with missing condition addresses as unconditional',
            rows: [
                buildRow({
                    conditionAddress: undefined,
                    conditionEntity: {
                        address: ALLOW_FLAG,
                        label: 'Allow flag',
                        layer: 'condition',
                    },
                    whereAddress: daoAddress,
                }),
            ],
        },
        {
            name: 'DAO-granted outgoing rows when DAO permissions are enabled',
            rows: [
                buildRow({
                    whoAddress: daoAddress,
                    where: {
                        address: pluginAddress,
                        label: 'Core Governance',
                        layer: 'topLevelPlugin',
                        status: 'installed',
                    },
                    whereAddress: pluginAddress,
                }),
                buildRow({ whereAddress: daoAddress }),
            ],
        },
        {
            name: 'DAO-as-caller rows to unknown contracts when DAO permissions are enabled',
            rows: [
                buildRow({
                    whoAddress: daoAddress,
                    whereAddress: targetAddress,
                    where: {
                        address: targetAddress,
                        label: 'Unknown address',
                        layer: 'unknown',
                        status: 'unknown',
                    },
                }),
            ],
        },
        {
            name: 'locally undecoded permission hashes',
            rows: [
                buildRow({
                    permissionId: unknownPermissionId,
                    whereAddress: daoAddress,
                }),
            ],
        },
        {
            name: 'inactive and historical plugin endpoint rows',
            rows: [
                buildRow({
                    whereAddress: daoAddress,
                    who: {
                        address: pluginAddress,
                        label: 'Historical Core Governance DEPRECATED',
                        layer: 'historicalPlugin',
                        status: 'uninstalled',
                    },
                    whoAddress: pluginAddress,
                }),
                buildRow({
                    whereAddress: daoAddress,
                    who: {
                        address: parentPluginAddress,
                        label: 'Unknown status plugin',
                        layer: 'topLevelPlugin',
                        status: 'unknown',
                    },
                    whoAddress: parentPluginAddress,
                }),
                buildRow({
                    whereAddress: daoAddress,
                    who: {
                        address: targetAddress,
                        label: 'Core Governance',
                        layer: 'topLevelPlugin',
                        status: 'installed',
                    },
                    whoAddress: targetAddress,
                }),
            ],
            filters: { showDaoPermissions: false },
        },
        {
            name: 'open create-proposal and ordinary rows under the same rules',
            rows: [
                buildRow({
                    permissionId: createProposalPermissionId,
                    whoAddress: ANY_ADDR,
                    who: {
                        address: ANY_ADDR,
                        label: 'Unknown address',
                        layer: 'unknown',
                    },
                    whereAddress: pluginAddress,
                    where: {
                        address: pluginAddress,
                        interfaceType: 'spp',
                        label: 'Core Governance',
                        layer: 'topLevelPlugin',
                        status: 'installed',
                    },
                }),
                buildRow({ whereAddress: targetAddress }),
            ],
        },
        {
            name: 'ordinary rows that are not connected to the active DAO',
            rows: [
                buildRow({ whereAddress: daoAddress }),
                buildRow({ whereAddress: targetAddress }),
            ],
        },
        {
            name: 'subplugin rows when enabled',
            rows: [buildRow({ whereAddress: subpluginAddress })],
            daoPlugins: [
                buildPlugin({ address: subpluginAddress, isSubPlugin: true }),
            ],
            filters: { showSubpluginPermissions: true },
        },
    ])('keeps $name', ({ rows, daoPlugins = [], filters }) => {
        const result = filterPermissionRows(rows, {
            ...defaultFilters,
            daoPlugins,
            ...filters,
        });

        expect(result).toEqual(rows);
    });

    // Every `hides` case pairs the hidden row with a kept second row, proving the two explicit
    // predicates hide precisely their own row class and nothing else.
    it.each<IFilterCase>([
        {
            name: 'permissions granted to the active DAO by default',
            rows: [
                buildRow({ whoAddress: daoAddress }),
                buildRow({ whoAddress: pluginAddress }),
            ],
            filters: {
                showDaoPermissions: false,
                showSubpluginPermissions: true,
            },
        },
        {
            name: 'rows targeting installed subplugins by default',
            rows: [
                buildRow({ whereAddress: subpluginAddress }),
                buildRow({
                    whoAddress: pluginAddress,
                    whereAddress: daoAddress,
                }),
            ],
            daoPlugins: [
                buildPlugin({
                    address: subpluginAddress,
                    isSubPlugin: true,
                    parentPlugin: parentPluginAddress,
                }),
            ],
        },
        {
            name: 'rows targeting plugins with a parent plugin by default',
            rows: [
                buildRow({ whereAddress: subpluginAddress }),
                buildRow({
                    whoAddress: pluginAddress,
                    whereAddress: daoAddress,
                }),
            ],
            daoPlugins: [
                buildPlugin({
                    address: subpluginAddress,
                    parentPlugin: parentPluginAddress,
                }),
            ],
        },
        {
            name: 'rows targeting addresses listed by a parent plugin subPlugins field',
            rows: [
                buildRow({ whereAddress: subpluginAddress }),
                buildRow({
                    whoAddress: pluginAddress,
                    whereAddress: daoAddress,
                }),
            ],
            daoPlugins: [
                buildPlugin({
                    address: parentPluginAddress,
                    subPlugins: [{ addresses: [subpluginAddress] }],
                }),
            ],
        },
        {
            name: 'backend-classified subplugin rows without installed-plugin metadata',
            rows: [
                buildRow({
                    whoAddress: pluginAddress,
                    where: subpluginWhere,
                    whereAddress: subpluginAddress,
                }),
                buildRow({
                    whoAddress: pluginAddress,
                    whereAddress: daoAddress,
                }),
            ],
        },
        {
            name: 'process-internal child rows whose target has a parent plugin',
            rows: [
                buildRow({
                    whoAddress: pluginAddress,
                    where: {
                        address: targetAddress,
                        label: 'Core Governance Delegate (Veto)',
                        layer: 'processInternal',
                        parentPluginAddress,
                        parentPluginName: 'Core Governance',
                    },
                    whereAddress: targetAddress,
                }),
                buildRow({ whereAddress: daoAddress }),
            ],
        },
        {
            // FLT-2 guard: the deleted CREATE_PROPOSAL_PERMISSION_NAME carve-out must not return.
            name: 'create-proposal rows targeting a subplugin without a name carve-out',
            rows: [
                buildRow({
                    permissionId: createProposalPermissionId,
                    whoAddress: pluginAddress,
                    who: {
                        address: pluginAddress,
                        interfaceType: 'spp',
                        label: 'Core Governance',
                        layer: 'topLevelPlugin',
                        status: 'installed',
                    },
                    whereAddress: subpluginAddress,
                    where: {
                        address: subpluginAddress,
                        brandId: 'safe',
                        label: 'Process internal',
                        layer: 'processInternal',
                        parentPluginAddress: pluginAddress,
                    },
                }),
                buildRow({ whereAddress: daoAddress }),
            ],
        },
    ])('hides $name', ({ rows, daoPlugins = [], filters }) => {
        const result = filterPermissionRows(rows, {
            ...defaultFilters,
            daoPlugins,
            ...filters,
        });

        expect(result).toEqual([rows[1]]);
    });

    it.each([
        {
            showDaoPermissions: false,
            showSubpluginPermissions: false,
            expectedIndexes: [0, 2],
        },
        {
            showDaoPermissions: true,
            showSubpluginPermissions: false,
            expectedIndexes: [0, 1, 2],
        },
        {
            showDaoPermissions: false,
            showSubpluginPermissions: true,
            expectedIndexes: [0, 2],
        },
        {
            showDaoPermissions: true,
            showSubpluginPermissions: true,
            expectedIndexes: [0, 1, 2, 3],
        },
    ])('applies only the two visible controls ($showDaoPermissions, $showSubpluginPermissions)', ({
        showDaoPermissions,
        showSubpluginPermissions,
        expectedIndexes,
    }) => {
        const rows = [
            buildRow({ whereAddress: daoAddress }),
            buildRow({
                whoAddress: daoAddress,
                whereAddress: targetAddress,
            }),
            buildRow({
                who: subpluginWhere,
                whoAddress: subpluginAddress,
                whereAddress: daoAddress,
            }),
            buildRow({
                who: {
                    address: daoAddress,
                    label: 'DAO-managed subplugin process',
                    layer: 'processInternal',
                },
                whoAddress: daoAddress,
                where: subpluginWhere,
                whereAddress: subpluginAddress,
            }),
        ];

        const result = filterPermissionRows(rows, {
            activeAccountAddress: daoAddress,
            daoPlugins: [],
            showDaoPermissions,
            showSubpluginPermissions,
        });

        expect(result).toEqual(expectedIndexes.map((index) => rows[index]));
    });
});

describe('getPermissionRowToggleAvailability', () => {
    const bothHidden: IPermissionRowFilters = {
        activeAccountAddress: daoAddress,
        daoPlugins: [],
        showDaoPermissions: false,
        showSubpluginPermissions: false,
    };

    const bothAffectedRow = buildRow({
        whoAddress: daoAddress,
        where: subpluginWhere,
        whereAddress: subpluginAddress,
    });

    it.each([
        {
            name: 'no affected rows',
            rows: [buildRow({ whereAddress: daoAddress })],
            filters: bothHidden,
            expected: { daoPermissions: false, subpluginPermissions: false },
        },
        {
            name: 'a DAO-granted row',
            rows: [
                buildRow({
                    whoAddress: daoAddress,
                    whereAddress: targetAddress,
                }),
            ],
            filters: bothHidden,
            expected: { daoPermissions: true, subpluginPermissions: false },
        },
        {
            name: 'a backend-classified subplugin row',
            rows: [
                buildRow({
                    where: subpluginWhere,
                    whereAddress: subpluginAddress,
                }),
            ],
            filters: bothHidden,
            expected: { daoPermissions: false, subpluginPermissions: true },
        },
        {
            // AC-13 guard: a subplugin as the caller must never activate the subplugin control.
            name: 'a caller-side subplugin row',
            rows: [
                buildRow({
                    who: subpluginWhere,
                    whoAddress: subpluginAddress,
                }),
            ],
            filters: bothHidden,
            expected: { daoPermissions: false, subpluginPermissions: false },
        },
        {
            name: 'a row hidden by both active controls',
            rows: [bothAffectedRow],
            filters: bothHidden,
            expected: { daoPermissions: false, subpluginPermissions: false },
        },
        {
            name: 'a row hidden by both with the subplugin control off',
            rows: [bothAffectedRow],
            filters: { ...bothHidden, showSubpluginPermissions: true },
            expected: { daoPermissions: true, subpluginPermissions: false },
        },
        {
            name: 'a row hidden by both with the DAO control off',
            rows: [bothAffectedRow],
            filters: { ...bothHidden, showDaoPermissions: true },
            expected: { daoPermissions: false, subpluginPermissions: true },
        },
    ])('reports availability for $name', ({ rows, filters, expected }) => {
        expect(getPermissionRowToggleAvailability(rows, filters)).toEqual(
            expected,
        );
    });
});
