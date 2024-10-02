import { useDao } from '@/shared/api/daoService';

export const useDaoPluginIds = (daoId: string) => {
    const useDaoParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: useDaoParams });

    const pluginIds = dao?.plugins.map((plugin) => plugin.subdomain) ?? [];

    return pluginIds;
};
