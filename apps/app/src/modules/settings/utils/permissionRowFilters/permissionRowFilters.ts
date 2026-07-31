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
     * When false, rows whose target (`where`) is a governing body (subplugin)
     * are hidden.
     */
    showSubpluginPermissions: boolean;
}

/**
 * Registry-backed subplugin check: the plugin at `address` (or one of its
 * declared sub-plugins) is a governing body nested under a parent plugin.
 */
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

/**
 * A row endpoint is a governing body when the backend enrichment gives it a
 * parent plugin, or the plugin registry classifies it as a sub-plugin.
 */
const isGoverningBodyEndpoint = (
    address: string,
    entity: IPermissionRow['who'],
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[],
): boolean =>
    entity?.parentPluginAddress != null ||
    isSubpluginAddress(address, daoPlugins);

export const isDaoGrantedPermission = (
    row: IPermissionRow,
    activeAccountAddress?: string,
): boolean =>
    activeAccountAddress != null &&
    addressUtils.isAddressEqual(row.whoAddress, activeAccountAddress);

/**
 * A row targets a governing body (subplugin) — the predicate behind the
 * "hide permissions on governing bodies" toggle.
 */
export const isGoverningBodyTargetRow = (
    row: IPermissionRow,
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[],
): boolean => isGoverningBodyEndpoint(row.whereAddress, row.where, daoPlugins);

/**
 * Filters permission rows via exactly the two user-facing toggles:
 * - `showDaoPermissions === false`: hide rows the active DAO holds
 *   (`who` == active DAO).
 * - `showSubpluginPermissions === false`: hide rows whose target (`where`) is a
 *   governing body (subplugin). Permissions granted *on* a top-level plugin or
 *   the DAO — e.g. proposal creation on an SPP — always stay visible,
 *   regardless of who holds them.
 *
 * Every other row is shown. This page is a full permission audit, so nothing is
 * dropped by an implicit, untoggleable pre-filter.
 */
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

        if (
            !showSubpluginPermissions &&
            isGoverningBodyEndpoint(row.whereAddress, row.where, daoPlugins)
        ) {
            return false;
        }

        return true;
    });
};
