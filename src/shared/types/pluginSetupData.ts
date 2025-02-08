import type { Hex } from 'viem';

export interface IPluginSetupDataPermission {
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

export interface IPluginSetupData {
    /**
     * The address of the plugin contract to be installed.
     */
    pluginAddress: Hex;
    /**
     * The setup repo address.
     */
    pluginSetupRepo: Hex;
    /**
     * The version of the plugin (release and build - eg 1.1).
     */
    versionTag: {
        release: number;
        build: number;
    };
    preparedSetupData: {
        /**
         * An array of helper contract addresses used during the plugin setup process.
         */
        helpers: readonly Hex[];
        /**
         * An array of permission configurations that define the permissions to be granted or revoked during installation.
         */
        permissions: readonly IPluginSetupDataPermission[];
    };
}
