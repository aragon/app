import { addressUtils } from '@aragon/gov-ui-kit';
import type {
    IDaoPlugin,
    PermissionEntityLayer,
} from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';
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
     * When false, rows touching a subplugin, unresolved endpoint, or disconnected address are hidden.
     */
    showSubpluginPermissions: boolean;
}

const INACTIVE_PLUGIN_STATUSES = new Set(['uninstalled', 'historical']);

const UNRESOLVED_SUPPORTING_LAYERS = new Set<PermissionEntityLayer>([
    'contract',
    'unknown',
]);

const PERMISSION_HASH_PATTERN = /^0x[a-f0-9]{64}$/iu;
const CREATE_PROPOSAL_PERMISSION_NAME = 'CREATE_PROPOSAL_PERMISSION';

const isInactivePluginEndpoint = (row: IPermissionRow): boolean => {
    const endpointEntities = [row.who, row.where];

    return endpointEntities.some(
        (entity) =>
            entity?.status != null &&
            INACTIVE_PLUGIN_STATUSES.has(entity.status),
    );
};

const isUnresolvedSupportingEndpoint = (
    entity?: IPermissionRow['who'],
): boolean =>
    entity?.layer != null && UNRESOLVED_SUPPORTING_LAYERS.has(entity.layer);

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

const isTopLevelProcessEndpoint = (
    address: string,
    entity?: IPermissionRow['who'],
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[],
): boolean =>
    entity?.layer === 'processInternal' &&
    entity.parentPluginAddress == null &&
    !isSubpluginAddress(address, daoPlugins);

const rowTouchesTopLevelProcess = (
    row: IPermissionRow,
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[],
): boolean =>
    isTopLevelProcessEndpoint(row.whoAddress, row.who, daoPlugins) ||
    isTopLevelProcessEndpoint(row.whereAddress, row.where, daoPlugins);

const rowTouchesSubplugin = (
    row: IPermissionRow,
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[],
): boolean =>
    isSubpluginAddress(row.whoAddress, daoPlugins) ||
    isSubpluginAddress(row.whereAddress, daoPlugins);

const rowTouchesUnresolvedSupportingEndpoint = (row: IPermissionRow): boolean =>
    isUnresolvedSupportingEndpoint(row.who) ||
    isUnresolvedSupportingEndpoint(row.where);

const rowHasUnresolvedPermission = (row: IPermissionRow): boolean => {
    if (!PERMISSION_HASH_PATTERN.test(row.permissionId)) {
        return false;
    }

    return permissionNameUtils
        .getPermissionName(row.permissionId)
        .startsWith('0x');
};
const isDaoGrantedPermission = (
    row: IPermissionRow,
    activeAccountAddress?: string,
): boolean =>
    activeAccountAddress != null &&
    addressUtils.isAddressEqual(row.whoAddress, activeAccountAddress);

const isGoverningBodyProposalCreationRow = (row: IPermissionRow): boolean =>
    permissionNameUtils.getPermissionName(row.permissionId) ===
        CREATE_PROPOSAL_PERMISSION_NAME &&
    (row.where?.layer === 'topLevelPlugin' ||
        row.where?.layer === 'historicalPlugin');

const isResidualPermission = (
    row: IPermissionRow,
    activeAccountAddress?: string,
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[],
): boolean =>
    activeAccountAddress != null &&
    !rowTouchesTopLevelProcess(row, daoPlugins) &&
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
        if (isInactivePluginEndpoint(row)) {
            return false;
        }

        if (
            !showDaoPermissions &&
            isDaoGrantedPermission(row, activeAccountAddress)
        ) {
            return false;
        }

        if (
            !showSubpluginPermissions &&
            !isGoverningBodyProposalCreationRow(row) &&
            (rowTouchesSubplugin(row, daoPlugins) ||
                rowTouchesUnresolvedSupportingEndpoint(row) ||
                rowHasUnresolvedPermission(row) ||
                isResidualPermission(row, activeAccountAddress, daoPlugins))
        ) {
            return false;
        }

        return true;
    });
};
