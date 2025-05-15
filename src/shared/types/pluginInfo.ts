import type { Hex } from 'viem';
import type { Network } from '../api/daoService';
import type { IPlugin } from '../utils/pluginRegistryUtils';
import type { IContractVersionInfo } from './contractVersionInfo';
import type { IPluginInfoSetup } from './pluginInfoSetup';

export interface IPluginInfo extends IPlugin {
    /**
     * Plugin version to be install on governance designer process.
     */
    installVersion: IContractVersionInfo;
    /**
     * Repository address of the plugin for each supported network.
     */
    repositoryAddresses: Record<Network, Hex>;
    /**
     * Setup data for plugins that can be included in the governance designer process.
     */
    setup?: IPluginInfoSetup;
}
