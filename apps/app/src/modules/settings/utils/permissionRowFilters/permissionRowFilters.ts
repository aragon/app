import { addressUtils } from '@aragon/gov-ui-kit';
import type { IDaoPermission, IDaoPlugin } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';

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

const isSubpluginEndpoint = (
    address: string,
    entity?: IDaoPermission['who'],
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[],
): boolean =>
    entity?.parentPluginAddress != null ||
    isSubpluginAddress(address, daoPlugins);

const rowTouchesSubplugin = (
    row: IDaoPermission,
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[],
): boolean =>
    isSubpluginEndpoint(row.whoAddress, row.who, daoPlugins) ||
    isSubpluginEndpoint(row.whereAddress, row.where, daoPlugins);

const isDaoGrantedPermission = (
    row: IDaoPermission,
    activeAccountAddress?: string,
): boolean =>
    activeAccountAddress != null &&
    addressUtils.isAddressEqual(row.whoAddress, activeAccountAddress);

export interface IPermissionRowToggleAvailability {
    daoPermissions: boolean;
    subpluginPermissions: boolean;
}

export const filterPermissionRows = (
    rows: IDaoPermission[],
    filters: IPermissionRowFilters,
): IDaoPermission[] => {
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

export const getPermissionRowToggleAvailability = (
    rows: IDaoPermission[],
    filters: IPermissionRowFilters,
): IPermissionRowToggleAvailability => {
    const {
        activeAccountAddress,
        daoPlugins,
        showDaoPermissions,
        showSubpluginPermissions,
    } = filters;
    let daoPermissions = false;
    let subpluginPermissions = false;

    for (const row of rows) {
        const isDaoPermission = isDaoGrantedPermission(
            row,
            activeAccountAddress,
        );
        const isSubpluginPermission = rowTouchesSubplugin(row, daoPlugins);

        if (
            isDaoPermission &&
            (showSubpluginPermissions || !isSubpluginPermission)
        ) {
            daoPermissions = true;
        }

        if (isSubpluginPermission && (showDaoPermissions || !isDaoPermission)) {
            subpluginPermissions = true;
        }

        if (daoPermissions && subpluginPermissions) {
            break;
        }
    }

    return { daoPermissions, subpluginPermissions };
};
