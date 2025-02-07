import type { Hex } from 'viem';

export interface IPluginSetupDataPermission {
    operation: number;
    where: Hex;
    who: Hex;
    condition: Hex;
    permissionId: Hex;
}

export interface IPluginSetupData {
    pluginAddress: Hex;
    pluginSetupRepo: Hex;
    versionTag: { release: number; build: number };
    preparedSetupData: { helpers: readonly Hex[]; permissions: readonly IPluginSetupDataPermission[] };
}
