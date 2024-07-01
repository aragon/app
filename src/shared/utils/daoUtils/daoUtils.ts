import { daoService, type IDao } from '@/shared/api/daoService';
import type { IDaoPageParams } from '@/shared/types';
import { type Metadata } from 'next';
import { ipfsUtils } from '../ipfsUtils';
import { pluginRegistryUtils } from '../pluginRegistryUtils';

export interface IGenerateDaoMetadataParams {
    /**
     * Path parameters of DAO pages.
     */
    params: IDaoPageParams;
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
}

export const daoUtils = new DaoUtils();
