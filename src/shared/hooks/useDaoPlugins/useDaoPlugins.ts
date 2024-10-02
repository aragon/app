import { useDao } from '@/shared/api/daoService';
import type { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';

export interface IUseDaoPluginsParams {
    /**
     * ID of the DAO to get the plugins for.
     */
    daoId: string;
    /**
     * Only returns the plugins with the specified type when set.
     */
    type?: PluginType;
}

export const useDaoPlugins = (params: IUseDaoPluginsParams) => {
    const { daoId, type } = params;

    const daoParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoParams });

    const plugins = daoUtils.getDaoPlugins(dao, { type });

    const processedPlugins = plugins?.map((plugin) => ({
        id: plugin.subdomain,
        tabId: `${plugin.subdomain}-${plugin.address}`,
        label: daoUtils.formatPluginName(plugin.subdomain),
        meta: plugin,
    }));

    return processedPlugins;
};
