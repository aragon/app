import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import { PluginType } from '@/shared/types';
import { addressUtils } from '@aragon/gov-ui-kit';
import { pluginRegistryUtils } from '../pluginRegistryUtils';

export interface IGetDaoPluginsParams {
    /**
     * Only returns the plugins with the specified type when set.
     */
    type?: PluginType;
    /**
     * Only returns the plugin with the specified address when set.
     */
    pluginAddress?: string;
    /**
     * Include sub-plugins in the result.
     * @default false
     */
    includeSubPlugins?: boolean;
    /**
     * Only returns the plugin with the specified subdomain when set.
     */
    subdomain?: string;
}

class DaoUtils {
    hasSupportedPlugins = (dao?: IDao): boolean => {
        const pluginIds = dao?.plugins.map(({ subdomain }) => subdomain);

        return pluginRegistryUtils.listContainsRegisteredPlugins(pluginIds);
    };

    getDaoEns = (dao?: IDao): string | undefined =>
        dao?.subdomain != null && dao.subdomain !== '' ? `${dao.subdomain}.dao.eth` : undefined;

    getPluginName = (plugin: IDaoPlugin): string => {
        if (plugin.name) {
            return plugin.name;
        }

        if (typeof plugin.subdomain !== 'string') {
            return 'Unknown';
        }

        const parts = plugin.subdomain.split('-');
        return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
    };

    getDaoPlugins = (dao?: IDao, params?: IGetDaoPluginsParams) => {
        const { type, pluginAddress, includeSubPlugins = false, subdomain } = params ?? {};
        return dao?.plugins.filter(
            (plugin) =>
                this.filterPluginByAddress(plugin, pluginAddress) &&
                this.filterPluginByType(plugin, type) &&
                this.filterBySubPlugin(plugin, includeSubPlugins) &&
                this.filterBySubdomain(plugin, subdomain),
        );
    };

    private filterPluginByAddress = (plugin: IDaoPlugin, address?: string) =>
        address == null || addressUtils.isAddressEqual(plugin.address, address);

    private filterPluginByType = (plugin: IDaoPlugin, type?: PluginType) =>
        type == null ||
        (type === PluginType.BODY && plugin.isBody) ||
        (type === PluginType.PROCESS && plugin.isProcess);

    private filterBySubPlugin = (plugin: IDaoPlugin, includeSubPlugins: boolean) =>
        includeSubPlugins || !plugin.isSubPlugin;

    private filterBySubdomain = (plugin: IDaoPlugin, subdomain?: string) =>
        subdomain == null || plugin.subdomain === subdomain;
}

export const daoUtils = new DaoUtils();
