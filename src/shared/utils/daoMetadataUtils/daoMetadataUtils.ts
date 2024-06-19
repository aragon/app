import { daoService } from '@/shared/api/daoService';
import type { IDaoPageParams } from '@/shared/types';
import { type Metadata } from 'next';
import { ipfsUtils } from '../ipfsUtils';

export interface IGenerateDaoMetadataParams {
    /**
     * Path parameters of DAO pages.
     */
    params: IDaoPageParams;
}

class DaoMetadataUtils {
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
}

export const daoMetadataUtils = new DaoMetadataUtils();
