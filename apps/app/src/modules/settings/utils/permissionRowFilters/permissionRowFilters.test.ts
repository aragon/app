import type { IDaoPlugin } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { generateFilterComponentPlugin } from '@/shared/testUtils/generators';
import type { IPermissionRow } from '../../types';
import { filterPermissionRows } from './permissionRowFilters';

const daoAddress = '0x1111111111111111111111111111111111111111';
const pluginAddress = '0x2222222222222222222222222222222222222222';
const subpluginAddress = '0x3333333333333333333333333333333333333333';
const targetAddress = '0x4444444444444444444444444444444444444444';
const parentPluginAddress = '0x5555555555555555555555555555555555555555';

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
            buildRow({ whoAddress: pluginAddress }),
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
            buildRow({ whoAddress: pluginAddress }),
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
});
