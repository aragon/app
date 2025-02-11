import type { Hex } from 'viem';
import type { Network } from '../api/daoService';
import type { IPlugin } from '../utils/pluginRegistryUtils';
import type { IPluginSetupVersionTag } from '../utils/pluginTransactionUtils';

export interface IPluginInfo extends IPlugin {
    /**
     * Plugin version to be install on governance designer process.
     */
    installVersion: IPluginSetupVersionTag;
    /**
     * Repository address of the plugin for each supported network.
     */
    repositoryAddresses: Record<Network, Hex>;
}
