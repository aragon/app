import type { Hex } from 'viem';
import type { INavigationLink } from '@/shared/components/navigation';
import type { Network } from '../api/daoService';
import type { IPlugin } from '../utils/pluginRegistryUtils';
import type { IContractVersionInfo } from './contractVersionInfo';
import type { IPluginInfoSetup } from './pluginInfoSetup';

export interface IPluginInfo extends IPlugin {
    /**
     * Plugin version to be installed on governance designer process.
     */
    installVersion: IContractVersionInfo;
    /**
     * Repository address of the plugin for each supported network.
     */
    repositoryAddresses: Record<Network, Hex>;
    /**
     * Subdomain of deployed plugin instance. Used when we need to distinguish between plugins with the same `interfaceType`.
     */
    subdomain: string;
    /**
     * Setup data for plugins that can be included in the governance designer process.
     */
    setup?: IPluginInfoSetup;
    /**
     * Plugin-specific pages shown on the DAO navigation. Use `order` on each link to control position.
     * The links are the same wherever the navigation renders: the bar drops its inline links on the
     * width of the application column, which the portalled dialog cannot observe, so a link that is
     * listed in one surface and not the other would become unreachable.
     */
    pageLinks?: (baseUrl: string) => INavigationLink[];
}
