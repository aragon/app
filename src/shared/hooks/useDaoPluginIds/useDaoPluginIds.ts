import { useDao } from '@/shared/api/daoService';

/**
 * @deprecated Use PluginSingleComponent with a specific plugin id instead to support multi-plugin DAOs
 */
export const useDaoPluginIds = (daoId: string) => {
    const useDaoParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: useDaoParams });

    const pluginIds = dao?.plugins.map((plugin) => plugin.subdomain) ?? [];

    return pluginIds;
};
