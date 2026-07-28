import { addressUtils } from '@aragon/gov-ui-kit';
import type {
    IDaoPlugin,
    PermissionEntityLayer,
} from '@/shared/api/daoService';
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
     * When false, rows touching a supporting entity or disconnected from the active DAO are hidden.
     */
    showSubpluginPermissions: boolean;
}

const SUPPORTING_PERMISSION_LAYERS = new Set<PermissionEntityLayer>([
    'processInternal',
    'condition',
    'externalActor',
    'historicalPlugin',
    'contract',
    'unknown',
]);

const isSupportingPermissionLayer = (layer?: PermissionEntityLayer): boolean =>
    layer != null && SUPPORTING_PERMISSION_LAYERS.has(layer);

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

const rowTouchesSupportingPermission = (
    row: IPermissionRow,
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[],
): boolean =>
    isSupportingPermissionLayer(row.who?.layer) ||
    isSupportingPermissionLayer(row.where?.layer) ||
    isSubpluginAddress(row.whoAddress, daoPlugins) ||
    isSubpluginAddress(row.whereAddress, daoPlugins);

const isDaoGrantedPermission = (
    row: IPermissionRow,
    activeAccountAddress?: string,
): boolean =>
    activeAccountAddress != null &&
    addressUtils.isAddressEqual(row.whoAddress, activeAccountAddress);

const isResidualPermission = (
    row: IPermissionRow,
    activeAccountAddress?: string,
): boolean =>
    activeAccountAddress != null &&
    !addressUtils.isAddressEqual(row.whoAddress, activeAccountAddress) &&
    !addressUtils.isAddressEqual(row.whereAddress, activeAccountAddress);

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
            (rowTouchesSupportingPermission(row, daoPlugins) ||
                isResidualPermission(row, activeAccountAddress))
        ) {
            return false;
        }

        return true;
    });
};
