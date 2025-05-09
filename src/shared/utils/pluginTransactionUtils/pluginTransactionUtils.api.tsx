import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import type { Hex } from 'viem';
import type { ITransactionRequest } from '../transactionUtils';

export interface IPluginSetupPermission {
    /**
     * The type of operation to be performed (grant/revoke).
     */
    operation: number;
    /**
     * The target address where the permission will be applied.
     */
    where: Hex;
    /**
     * The address that is being granted or revoked the permission.
     */
    who: Hex;
    /**
     * The address of a condition contract that must be satisfied for this permission to be effective.
     */
    condition: Hex;
    /**
     * A unique identifier for the permission.
     */
    permissionId: Hex;
}

export interface IPluginSetupVersionTag {
    /**
     * Relese number of the plugin to be installed.
     */
    release: number;
    /**
     * Build number of the plugin to be installed.
     */
    build: number;
}

export interface IPluginSetupPreparedSetupData {
    /**
     * An array of helper contract addresses used during the plugin setup process.
     */
    helpers: readonly Hex[];
    /**
     * An array of permission configurations that define the permissions to be granted or revoked during installation.
     */
    permissions: readonly IPluginSetupPermission[];
}

export interface IPluginSetupData {
    /**
     * The setup repo address.
     */
    pluginSetupRepo: Hex;
    /**
     * The version of the plugin to be installed.
     */
    versionTag: IPluginSetupVersionTag;
    /**
     * Helpers and permissions for the plugin setup.
     */
    preparedSetupData: IPluginSetupPreparedSetupData;
}

export interface IPluginInstallationSetupData extends IPluginSetupData {
    /**
     * The address of the plugin contract to be installed.
     */
    pluginAddress: Hex;
}

export interface IPluginUpdateSetupData extends IPluginSetupData {
    /**
     * Initialization data to be passed to the contract update function.
     */
    initData: Hex;
}

export interface IBuildApplyPluginsInstallationActionsParams {
    /**
     * DAO to apply the plugin installation for.
     */
    dao: IDao;
    /**
     * List of plugin installation setup data to be applied.
     */
    setupData: IPluginInstallationSetupData[];
    /**
     * Other actions to be added to the installaction action array before the revoke root permission transaction.
     */
    actions?: ITransactionRequest[];
}

export interface IBuildApplyPluginsUpdateActionsParams {
    /**
     * DAO to apply the plugin updates for.
     */
    dao: IDao;
    /**
     * List of plugins to apply the update for.
     */
    plugins: IDaoPlugin[];
    /**
     * List of plugin update setup data to be applied.
     */
    setupData: IPluginUpdateSetupData[];
}
