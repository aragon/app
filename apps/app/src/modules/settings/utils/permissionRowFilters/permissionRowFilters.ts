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

type PermissionRowWithParentMetadata = IPermissionRow & {
    hasParent?: boolean;
    whoHasParent?: boolean;
    whereHasParent?: boolean;
    who?: { hasParent?: boolean };
    where?: { hasParent?: boolean };
    whoEntity?: { hasParent?: boolean };
    whereEntity?: { hasParent?: boolean };
};

const hasParentFlag = (value?: boolean): boolean => value === true;

const hasRowParentMetadata = (row: IPermissionRow): boolean => {
    const rowWithMetadata = row as PermissionRowWithParentMetadata;

    return (
        hasParentFlag(rowWithMetadata.hasParent) ||
        hasParentFlag(rowWithMetadata.whoHasParent) ||
        hasParentFlag(rowWithMetadata.whereHasParent) ||
        hasParentFlag(rowWithMetadata.who?.hasParent) ||
        hasParentFlag(rowWithMetadata.where?.hasParent) ||
        hasParentFlag(rowWithMetadata.whoEntity?.hasParent) ||
        hasParentFlag(rowWithMetadata.whereEntity?.hasParent)
    );
};

const isSubplugin = (plugin: IFilterComponentPlugin<IDaoPlugin>): boolean => {
    const { meta } = plugin;

    return (
        meta.isSubPlugin === true ||
        meta.hasParent === true ||
        meta.parentPlugin != null
    );
};

const rowTouchesSubplugin = (
    row: IPermissionRow,
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[],
): boolean => {
    if (hasRowParentMetadata(row)) {
        return true;
    }

    return (
        daoPlugins
            ?.filter(isSubplugin)
            .some(
                (plugin) =>
                    addressUtils.isAddressEqual(
                        plugin.meta.address,
                        row.whoAddress,
                    ) ||
                    addressUtils.isAddressEqual(
                        plugin.meta.address,
                        row.whereAddress,
                    ),
            ) ?? false
    );
};

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
