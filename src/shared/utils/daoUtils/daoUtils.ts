import {
    daoService,
    type IDao,
    type IDaoPlugin,
    type ISubDaoSummary,
    type Network,
    type PluginInterfaceType,
} from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    type IDaoPageParams,
    type IPluginInfo,
    PluginType,
} from '@/shared/types';
import { pluginRegistryUtils } from '../pluginRegistryUtils';
import { versionComparatorUtils } from '../versionComparatorUtils';

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
     * Include plugins that belong to the subDAOs in the result.
     * @default true
     */
    includeSubDaos?: boolean;
    /**
     * Only returns the plugin with the specified interfaceType when set.
     */
    interfaceType?: PluginInterfaceType;
    /**
     * Only returns the plugin with the specified slug when set.
     */
    slug?: string;
    /**
     * Only returns plugins with full execute permissions when set to true.
     */
    hasExecute?: boolean;
}

export interface IDaoAvailableUpdates {
    /**
     * Defines if the OSx version can be updated.
     */
    osx: boolean;
    /**
     * Defines if the DAO has plugins that can be updated.
     */
    plugins: boolean;
}

class DaoUtils {
    hasPluginBody = (dao?: IDao): boolean =>
        dao?.plugins.some((p) => p.isBody) ?? false;

    hasSupportedPlugins = (dao?: IDao): boolean => {
        const pluginIds = dao?.plugins.map(
            ({ interfaceType }) => interfaceType,
        );

        return pluginRegistryUtils.listContainsRegisteredPlugins(pluginIds);
    };

    getDaoEns = (dao?: IDao): string | undefined =>
        dao?.ens != null && dao.ens !== '' ? dao.ens : undefined;

    getPluginName = (plugin: IDaoPlugin): string => {
        if (plugin.name) {
            return plugin.name;
        }

        if (plugin.subdomain) {
            return this.parsePluginSubdomain(plugin.subdomain);
        }

        return this.parsePluginInterfaceType(plugin.interfaceType);
    };

    getDaoPlugins = (dao?: IDao, params?: IGetDaoPluginsParams) => {
        const {
            type,
            pluginAddress,
            includeSubPlugins = false,
            includeSubDaos = true,
            interfaceType,
            hasExecute,
            slug,
        } = params ?? {};

        return dao?.plugins.filter(
            (plugin) =>
                this.filterPluginByAddress(plugin, pluginAddress) &&
                this.filterPluginByType(plugin, type) &&
                this.filterBySubPlugin(plugin, includeSubPlugins) &&
                this.filterBySubDaos(dao?.subDaos, plugin, includeSubDaos) &&
                this.filterByInterfaceType(plugin, interfaceType) &&
                this.filterByHasExecute(plugin, hasExecute) &&
                this.filterBySlug(plugin, slug),
        );
    };

    /**
     * Parses the plugin subdomain to a human readable string.
     * @example
     * parsePluginSubdomain('token-voting') -> 'Token Voting'
     * parsePluginSubdomain('lock-to-vote-plugin') -> 'Lock to Vote Plugin'
     * @param subdomain - The subdomain to parse.
     * @returns The parsed subdomain in Title Case.
     */
    parsePluginSubdomain = (subdomain: string): string => {
        const parts = subdomain.split('-');

        return parts
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
    };

    /**
     * Parses the plugin interface type to a human readable string.
     * @example
     * parsePluginInterfaceType('tokenVoting') -> 'Token Voting'
     * parsePluginInterfaceType('multisig') -> 'Multisig'
     * parsePluginInterfaceType('lockToVote') -> 'Lock to Vote'
     * @param interfaceType - The interface type to parse.
     * @returns The parsed interface type in Title Case.
     */
    parsePluginInterfaceType = (interfaceType: string): string => {
        const parts = interfaceType.split(/(?=[A-Z])/);

        return parts
            .map(
                (part) =>
                    part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
            )
            .join(' ');
    };

    hasAvailableUpdates = (dao?: IDao): IDaoAvailableUpdates => {
        const osx = this.hasAvailableOsxUpdate(dao);
        const plugins = this.getAvailablePluginUpdates(dao);

        return { osx, plugins: plugins.length > 0 };
    };

    hasAvailableOsxUpdate = (dao?: IDao): boolean => {
        const { protocolVersion } =
            dao != null ? networkDefinitions[dao.network] : {};

        return versionComparatorUtils.isLessThan(dao?.version, protocolVersion);
    };

    getAvailablePluginUpdates = (dao?: IDao): IDaoPlugin[] => {
        const registeredPlugins =
            pluginRegistryUtils.getPlugins() as IPluginInfo[];
        const availablePluginUpdates = dao?.plugins.filter((plugin) => {
            // We need to get the registered plugin by subdomain, not by interfaceType!
            // There might be a plugin with the same interfaceType but from different repository, and we don't want to allow updating such plugins.
            const target = registeredPlugins.find(
                (registeredPlugin) =>
                    registeredPlugin.subdomain === plugin.subdomain,
            );

            return versionComparatorUtils.isLessThan(
                plugin,
                target?.installVersion,
            );
        });

        return availablePluginUpdates ?? [];
    };

    resolveDaoId = async (params: IDaoPageParams) => {
        const { addressOrEns, network } = params;

        if (addressOrEns.endsWith('.eth')) {
            const dao = await daoService.getDaoByEns({
                urlParams: { network, ens: addressOrEns },
            });

            return `${network}-${dao.address}`;
        }

        return `${network}-${addressOrEns}`;
    };

    parseDaoId = (daoId: string) => {
        const lastDash = daoId.lastIndexOf('-');
        const network = daoId.substring(0, lastDash) as Network;
        const address = daoId.substring(lastDash + 1);

        return { network, address };
    };

    getDaoUrl = (dao?: IDao, path?: string): string | undefined => {
        if (dao == null) {
            return;
        }

        const { network, address } = dao;

        const ensName = this.getDaoEns(dao);
        const baseUrl = `/dao/${network}/${ensName ?? address}`;
        const fullPath = path != null ? `${baseUrl}/${path}` : baseUrl;

        return fullPath;
    };

    private filterPluginByAddress = (plugin: IDaoPlugin, address?: string) =>
        address == null ||
        plugin.address.toLowerCase() === address.toLowerCase();

    private filterPluginByType = (plugin: IDaoPlugin, type?: PluginType) =>
        type == null ||
        (type === PluginType.BODY && plugin.isBody) ||
        (type === PluginType.PROCESS && plugin.isProcess);

    private filterBySubPlugin = (
        plugin: IDaoPlugin,
        includeSubPlugins: boolean,
    ) => includeSubPlugins || !plugin.isSubPlugin;

    private filterBySubDaos = (
        subDaos: ISubDaoSummary[] | undefined,
        plugin: IDaoPlugin,
        includeSubDaos: boolean,
    ) =>
        includeSubDaos ||
        !subDaos?.some(
            (subDao) =>
                subDao.address.toLowerCase() ===
                plugin.daoAddress?.toLowerCase(),
        );

    private filterByInterfaceType = (
        plugin: IDaoPlugin,
        interfaceType?: PluginInterfaceType,
    ) => interfaceType == null || plugin.interfaceType === interfaceType;

    private filterBySlug = (plugin: IDaoPlugin, slug?: string) =>
        slug == null || plugin.slug === slug;

    private filterByHasExecute = (plugin: IDaoPlugin, hasExecute?: boolean) =>
        !hasExecute || plugin.conditionAddress == null;
}

export const daoUtils = new DaoUtils();
