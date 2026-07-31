import type { IDaoPlugin } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { generateFilterComponentPlugin } from '@/shared/testUtils/generators';
import { ANY_ADDR } from '../../constants/permissionSentinels';
import type { IPermissionRow } from '../../types';
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

const buildRow = (partial: Partial<IPermissionRow>): IPermissionRow => ({
    permissionId: 'permission-id',
    whoAddress: pluginAddress,
    whereAddress: targetAddress,
    conditionAddress: '0x0000000000000000000000000000000000000002',
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
    describe('hide permissions granted to the DAO', () => {
        it('hides rows the active DAO holds (who === DAO) when disabled', () => {
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

        it('keeps DAO-held rows when enabled', () => {
            const rows = [buildRow({ whoAddress: daoAddress })];

            const result = filterPermissionRows(rows, {
                activeAccountAddress: daoAddress,
                daoPlugins: [],
                showDaoPermissions: true,
                showSubpluginPermissions: true,
            });

            expect(result).toEqual(rows);
        });

        it('keys off who only — a row targeting the DAO is not DAO-granted', () => {
            const rows = [
                buildRow({
                    whoAddress: pluginAddress,
                    whereAddress: daoAddress,
                }),
            ];

            const result = filterPermissionRows(rows, {
                activeAccountAddress: daoAddress,
                daoPlugins: [],
                showDaoPermissions: false,
                showSubpluginPermissions: true,
            });

            expect(result).toEqual(rows);
        });
    });

    describe('hide permissions on governing bodies (subplugin targets)', () => {
        it('hides rows whose target is a registered subplugin', () => {
            const rows = [
                buildRow({ whereAddress: subpluginAddress }),
                buildRow({ whereAddress: daoAddress }),
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

        it('hides rows whose target is backend-marked with a parent plugin', () => {
            const rows = [
                buildRow({
                    whereAddress: subpluginAddress,
                    where: {
                        address: subpluginAddress,
                        label: 'Core Governance Delegate',
                        layer: 'processInternal',
                        parentPluginAddress,
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

        it('hides rows whose target is listed by a parent plugin subPlugins field', () => {
            const rows = [
                buildRow({ whereAddress: subpluginAddress }),
                buildRow({ whereAddress: daoAddress }),
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

        it('keeps rows whose source is a governing body but target is top-level', () => {
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
            ];

            const result = filterPermissionRows(rows, {
                activeAccountAddress: daoAddress,
                daoPlugins: [],
                showDaoPermissions: true,
                showSubpluginPermissions: false,
            });

            expect(result).toEqual(rows);
        });

        it('keeps open create-proposal rows targeting a top-level plugin', () => {
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
            ];

            const result = filterPermissionRows(rows, {
                activeAccountAddress: daoAddress,
                daoPlugins: [],
                showDaoPermissions: true,
                showSubpluginPermissions: false,
            });

            expect(result).toEqual(rows);
        });

        it('keeps top-level process bodies without a parent plugin', () => {
            const rows = [
                buildRow({
                    whereAddress: targetAddress,
                    where: {
                        address: targetAddress,
                        label: 'Stage 1 proposal processor',
                        layer: 'processInternal',
                        parentPluginName: 'Core Governance',
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

        it('keeps subplugin-target rows when enabled', () => {
            const rows = [buildRow({ whereAddress: subpluginAddress })];
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
    });

    describe('full audit (no implicit pre-filters)', () => {
        it('keeps inactive/historical plugin rows', () => {
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
                showDaoPermissions: true,
                showSubpluginPermissions: true,
            });

            expect(result).toEqual(rows);
        });

        it('keeps residual rows unrelated to the DAO', () => {
            const rows = [
                buildRow({
                    whoAddress: pluginAddress,
                    whereAddress: targetAddress,
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

        it('keeps rows with locally undecoded permission hashes', () => {
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

        it('keeps DAO-as-caller rows to unknown contracts', () => {
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
    });
});
