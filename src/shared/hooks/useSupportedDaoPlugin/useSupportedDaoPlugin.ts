import { type IDaoPlugin, useDao } from '@/shared/api/daoService';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';

/**
 * @deprecated Handle all DAO plugins to support multi-plugin DAOs.
 */
export const useSupportedDaoPlugin = (daoId: string): IDaoPlugin | undefined => {
    const useDaoParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: useDaoParams });

    const supportedPlugin = dao?.plugins.find((plugin) => pluginRegistryUtils.getPlugin(plugin.subdomain) != null);

    return supportedPlugin;
};
