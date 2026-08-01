import type { IDaoPermission, IDaoPlugin } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import {
    generateDaoPermission,
    generateFilterComponentPlugin,
} from '@/shared/testUtils/generators';
import { ALLOW_FLAG, ANY_ADDR } from '../../constants/permissionSentinels';
import { filterPermissionRows } from './permissionRowFilters';

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

describe('filterPermissionRows', () => {
    it('hides permissions granted to the active DAO by default', () => {
        const rows = [
            buildRow({ whoAddress: daoAddress }),
            buildRow({ whoAddress: pluginAddress }),
        ];

        const result = filterPermissionRows(rows, {
            activeAccountAddress: daoAddress,
            daoPlugins: [],
            showDaoPermissions: false,
            showSubpluginPermissions: true,
        });

        expect(result).toEqual([rows[1]]);
    });

    it('keeps DAO-granted permissions when enabled', () => {
        const rows = [buildRow({ whoAddress: daoAddress })];

        const result = filterPermissionRows(rows, {
            activeAccountAddress: daoAddress,
            daoPlugins: [],
            showDaoPermissions: true,
            showSubpluginPermissions: true,
        });

        expect(result).toEqual(rows);
    });

    it('hides rows touching installed subplugins by default', () => {
        const rows = [
            buildRow({ whoAddress: subpluginAddress }),
            buildRow({ whoAddress: pluginAddress, whereAddress: daoAddress }),
        ];
        const daoPlugins = [
            buildPlugin({
                address: subpluginAddress,
                isSubPlugin: true,
                parentPlugin: parentPluginAddress,
            }),
        ];

        const result = filterPermissionRows(rows, {
            activeAccountAddress: daoAddress,
            daoPlugins,
            showDaoPermissions: true,
            showSubpluginPermissions: false,
        });

        expect(result).toEqual([rows[1]]);
    });

    it('hides rows touching plugins with a parent plugin by default', () => {
        const rows = [
            buildRow({ whereAddress: subpluginAddress }),
            buildRow({ whoAddress: pluginAddress, whereAddress: daoAddress }),
        ];
        const daoPlugins = [
            buildPlugin({
                address: subpluginAddress,
                parentPlugin: parentPluginAddress,
            }),
        ];

        const result = filterPermissionRows(rows, {
            activeAccountAddress: daoAddress,
            daoPlugins,
            showDaoPermissions: true,
            showSubpluginPermissions: false,
        });

        expect(result).toEqual([rows[1]]);
    });

    it('hides rows touching addresses listed by a parent plugin subPlugins field', () => {
        const rows = [
            buildRow({ whoAddress: subpluginAddress }),
            buildRow({ whoAddress: pluginAddress, whereAddress: daoAddress }),
        ];
        const daoPlugins = [
            buildPlugin({
                address: parentPluginAddress,
                subPlugins: [{ addresses: [subpluginAddress] }],
            }),
        ];

        const result = filterPermissionRows(rows, {
            activeAccountAddress: daoAddress,
            daoPlugins,
            showDaoPermissions: true,
            showSubpluginPermissions: false,
        });

        expect(result).toEqual([rows[1]]);
    });

    it('hides backend-classified subplugin rows without installed-plugin metadata', () => {
        const rows = [
            buildRow({
                whereAddress: daoAddress,
                who: {
                    address: subpluginAddress,
                    label: 'Process internal',
                    layer: 'processInternal',
                    parentPluginAddress,
                },
                whoAddress: subpluginAddress,
            }),
            buildRow({ whoAddress: pluginAddress, whereAddress: daoAddress }),
        ];
        const result = filterPermissionRows(rows, {
            activeAccountAddress: daoAddress,
            daoPlugins: [],
            showDaoPermissions: true,
            showSubpluginPermissions: false,
        });

        expect(result).toEqual([rows[1]]);
    });

    it('keeps top-level process body proposal permissions visible by default', () => {
        const rows = [
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
        ];

        const result = filterPermissionRows(rows, {
            activeAccountAddress: daoAddress,
            daoPlugins: [],
            showDaoPermissions: true,
            showSubpluginPermissions: false,
        });

        expect(result).toEqual(rows);
    });

    it('hides process-internal child rows when they do not touch the DAO', () => {
        const rows = [
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
        ];

        const result = filterPermissionRows(rows, {
            activeAccountAddress: daoAddress,
            daoPlugins: [],
            showDaoPermissions: true,
            showSubpluginPermissions: false,
        });

        expect(result).toEqual([rows[1]]);
    });

    it('keeps ALLOW_FLAG rows when backend sends a condition entity', () => {
        const rows = [
            buildRow({
                conditionAddress: ALLOW_FLAG,
                conditionEntity: {
                    address: ALLOW_FLAG,
                    label: 'Allow flag',
                    layer: 'condition',
                },
                whereAddress: daoAddress,
            }),
        ];

        const result = filterPermissionRows(rows, {
            activeAccountAddress: daoAddress,
            daoPlugins: [],
            showDaoPermissions: true,
            showSubpluginPermissions: false,
        });

        expect(result).toEqual(rows);
    });

    it('keeps real condition-contract rows when endpoints are primary entities', () => {
        const conditionAddress = '0x6666666666666666666666666666666666666666';
        const rows = [
            buildRow({
                conditionAddress,
                conditionEntity: {
                    address: conditionAddress,
                    label: 'Condition contract',
                    layer: 'condition',
                    status: 'installed',
                },
                whereAddress: daoAddress,
            }),
        ];

        const result = filterPermissionRows(rows, {
            activeAccountAddress: daoAddress,
            daoPlugins: [],
            showDaoPermissions: true,
            showSubpluginPermissions: false,
        });

        expect(result).toEqual(rows);
    });

    it('treats missing condition addresses as unconditional rows', () => {
        const rows = [
            buildRow({
                conditionAddress: undefined,
                conditionEntity: {
                    address: ALLOW_FLAG,
                    label: 'Allow flag',
                    layer: 'condition',
                },
                whereAddress: daoAddress,
            }),
        ];

        const result = filterPermissionRows(rows, {
            activeAccountAddress: daoAddress,
            daoPlugins: [],
            showDaoPermissions: true,
            showSubpluginPermissions: false,
        });

        expect(result).toEqual(rows);
    });

    it('keeps DAO-granted outgoing rows when DAO permissions are enabled', () => {
        const rows = [
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
        ];

        const result = filterPermissionRows(rows, {
            activeAccountAddress: daoAddress,
            daoPlugins: [],
            showDaoPermissions: true,
            showSubpluginPermissions: false,
        });

        expect(result).toEqual(rows);
    });

    it('keeps DAO-as-caller rows to unknown contracts when DAO permissions are enabled', () => {
        const rows = [
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
        ];

        const result = filterPermissionRows(rows, {
            activeAccountAddress: daoAddress,
            daoPlugins: [],
            showDaoPermissions: true,
            showSubpluginPermissions: false,
        });

        expect(result).toEqual(rows);
    });

    it('keeps locally undecoded permission hashes', () => {
        const rows = [
            buildRow({
                permissionId: unknownPermissionId,
                whereAddress: daoAddress,
            }),
        ];

        const result = filterPermissionRows(rows, {
            activeAccountAddress: daoAddress,
            daoPlugins: [],
            showDaoPermissions: true,
            showSubpluginPermissions: false,
        });

        expect(result).toEqual(rows);
    });

    it('keeps inactive and historical plugin endpoint rows', () => {
        const rows = [
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
        ];

        const result = filterPermissionRows(rows, {
            activeAccountAddress: daoAddress,
            daoPlugins: [],
            showDaoPermissions: false,
            showSubpluginPermissions: false,
        });

        expect(result).toEqual(rows);
    });

    it('keeps open create-proposal and ordinary rows under the same rules', () => {
        const rows = [
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
        ];

        const result = filterPermissionRows(rows, {
            activeAccountAddress: daoAddress,
            daoPlugins: [],
            showDaoPermissions: true,
            showSubpluginPermissions: false,
        });

        expect(result).toEqual(rows);
    });

    it('applies the subplugin filter to create-proposal rows without a name carve-out', () => {
        const rows = [
            buildRow({
                permissionId: createProposalPermissionId,
                whoAddress: subpluginAddress,
                who: {
                    address: subpluginAddress,
                    brandId: 'safe',
                    label: 'Process internal',
                    layer: 'processInternal',
                    parentPluginAddress: pluginAddress,
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
            buildRow({ whereAddress: daoAddress }),
        ];

        const result = filterPermissionRows(rows, {
            activeAccountAddress: daoAddress,
            daoPlugins: [],
            showDaoPermissions: true,
            showSubpluginPermissions: false,
        });

        expect(result).toEqual([rows[1]]);
    });

    it('keeps ordinary rows that are not connected to the active DAO', () => {
        const rows = [
            buildRow({ whereAddress: daoAddress }),
            buildRow({ whereAddress: targetAddress }),
        ];

        const result = filterPermissionRows(rows, {
            activeAccountAddress: daoAddress,
            daoPlugins: [],
            showDaoPermissions: true,
            showSubpluginPermissions: false,
        });

        expect(result).toEqual(rows);
    });

    it('keeps subplugin rows when enabled', () => {
        const rows = [buildRow({ whoAddress: subpluginAddress })];
        const daoPlugins = [
            buildPlugin({ address: subpluginAddress, isSubPlugin: true }),
        ];

        const result = filterPermissionRows(rows, {
            activeAccountAddress: daoAddress,
            daoPlugins,
            showDaoPermissions: true,
            showSubpluginPermissions: true,
        });

        expect(result).toEqual(rows);
    });

    it.each([
        {
            showDaoPermissions: false,
            showSubpluginPermissions: false,
            expectedIndexes: [0],
        },
        {
            showDaoPermissions: true,
            showSubpluginPermissions: false,
            expectedIndexes: [0, 1],
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
                who: {
                    address: subpluginAddress,
                    label: 'Subplugin process',
                    layer: 'processInternal',
                    parentPluginAddress,
                },
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
                where: {
                    address: subpluginAddress,
                    label: 'Subplugin process',
                    layer: 'processInternal',
                    parentPluginAddress,
                },
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
