import { daoService, type IDao, type IDaoPlugin, type Network } from '@/shared/api/daoService';
import { type IDaoPageParams, PluginType } from '@/shared/types';
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

        return this.parsePluginSubdomain(plugin.subdomain);
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

    parsePluginSubdomain = (subdomain: string): string => {
        const parts = subdomain.split('-');
        return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
    };

    /**
     * Resolves the DAO ID based on the provided network, address and ENS name.
     *
     * @throws Error if the ENS address is not found.
     */
    resolveDaoId = async (params: IDaoPageParams) => {
        const { addressOrEns, network } = params;

        if (addressOrEns.endsWith('.eth')) {
            const dao = await daoService.getDaoByEns({ urlParams: { network, ens: addressOrEns } });

            return `${network}-${dao.address}`;
        }

        return `${network}-${addressOrEns}`;
    };

    getDaoUrl = (dao?: IDao, path?: string): `/dao/${Network}/${string}` | undefined => {
        if (dao == null) {
            return undefined;
        }

        const { network, address, ens } = dao;
        const baseUrl = `/dao/${network}/${ens ?? address}`;
        const fullPath = path != null ? `${baseUrl}/${path}` : baseUrl;

        return fullPath as `/dao/${Network}/${string}`;
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
