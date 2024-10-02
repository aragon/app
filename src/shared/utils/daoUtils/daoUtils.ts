import { daoService, type IDao } from '@/shared/api/daoService';
import { type IDaoPageParams, PluginType } from '@/shared/types';
import { type Metadata } from 'next';
import { ipfsUtils } from '../ipfsUtils';
import { pluginRegistryUtils } from '../pluginRegistryUtils';

export interface IGenerateDaoMetadataParams {
    /**
     * Path parameters of DAO pages.
     */
    params: IDaoPageParams;
}

export interface IGetDaoPluginsParams {
    /**
     * Only returns the plugins with the specified type when set.
     */
    type?: PluginType;
}

class DaoUtils {
    generateMetadata = async ({ params }: IGenerateDaoMetadataParams): Promise<Metadata> => {
        const { id } = params;

        const getDaoParams = { id };
        const dao = await daoService.getDao({ urlParams: getDaoParams });

        const daoAvatarUrl = ipfsUtils.cidToSrc(dao.avatar);

        return {
            title: dao.name,
            description: dao.description,
            openGraph: { images: daoAvatarUrl ? [daoAvatarUrl] : undefined },
        };
    };

    hasSupportedPlugins = (dao?: IDao): boolean => {
        const pluginIds = dao?.plugins.map(({ subdomain }) => subdomain);

        return pluginRegistryUtils.listContainsRegisteredPlugins(pluginIds);
    };

    getDaoEns = (dao?: IDao): string | undefined =>
        dao?.subdomain != null && dao.subdomain !== '' ? `${dao.subdomain}.dao.eth` : undefined;

    formatPluginName = (pluginSubdomain: string): string => {
        const parts = pluginSubdomain.split('-');

        return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
    };

    getDaoPlugins = (dao?: IDao, params?: IGetDaoPluginsParams) => {
        const { type } = params ?? {};

        return dao?.plugins.filter(
            (plugin) =>
                type == null ||
                (type === PluginType.BODY && plugin.isBody && !plugin.isSubPlugin) ||
                (type === PluginType.PROCESS && plugin.isProcess && !plugin.isSubPlugin),
        );
    };
}

export const daoUtils = new DaoUtils();
