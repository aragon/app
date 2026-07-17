import { addressUtils } from '@aragon/gov-ui-kit';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import type { IPermissionRow } from '../../types';

export interface IPermissionRowFilters {
    /**
     * Address of the DAO / linked account currently being inspected.
     */
    activeAccountAddress?: string;
    /**
     * Installed plugin metadata used to identify current subplugins.
     */
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[];
    /**
     * When false, rows where the active DAO is the permission holder are hidden.
     */
    showDaoPermissions: boolean;
    /**
     * When false, rows touching a subplugin are hidden.
     */
    showSubpluginPermissions: boolean;
}

const isSubplugin = (plugin: IFilterComponentPlugin<IDaoPlugin>): boolean => {
    const { meta } = plugin;

    return meta.isSubPlugin === true || meta.parentPlugin != null;
};

const isSubpluginAddress = (
    address: string,
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[],
): boolean =>
    daoPlugins?.some((plugin) => {
        const { meta } = plugin;

        if (
            isSubplugin(plugin) &&
            addressUtils.isAddressEqual(meta.address, address)
        ) {
            return true;
        }

        return meta.subPlugins?.some((subPlugin) =>
            subPlugin.addresses.some((subPluginAddress) =>
                addressUtils.isAddressEqual(subPluginAddress, address),
            ),
        );
    }) ?? false;

const rowTouchesSubplugin = (
    row: IPermissionRow,
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[],
): boolean =>
    isSubpluginAddress(row.whoAddress, daoPlugins) ||
    isSubpluginAddress(row.whereAddress, daoPlugins);

const isDaoGrantedPermission = (
    row: IPermissionRow,
    activeAccountAddress?: string,
): boolean =>
    activeAccountAddress != null &&
    addressUtils.isAddressEqual(row.whoAddress, activeAccountAddress);

export const filterPermissionRows = (
    rows: IPermissionRow[],
    filters: IPermissionRowFilters,
): IPermissionRow[] => {
    const {
        activeAccountAddress,
        daoPlugins,
        showDaoPermissions,
        showSubpluginPermissions,
    } = filters;

    return rows.filter((row) => {
        if (
            !showDaoPermissions &&
            isDaoGrantedPermission(row, activeAccountAddress)
        ) {
            return false;
        }

        if (!showSubpluginPermissions && rowTouchesSubplugin(row, daoPlugins)) {
            return false;
        }

        return true;
    });
};
