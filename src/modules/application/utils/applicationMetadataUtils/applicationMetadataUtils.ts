import { daoService } from '@/shared/api/daoService';
import type { IDaoPageParams } from '@/shared/types';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { MetadataUtils } from '@/shared/utils/metadataUtils';
import type { Metadata } from 'next';

export interface IGenerateDaoMetadataParams {
    /**
     * Path parameters of DAO pages.
     */
    params: Promise<IDaoPageParams>;
}

class ApplicationMetadataUtils extends MetadataUtils {
    generateDaoMetadata = async ({ params }: IGenerateDaoMetadataParams): Promise<Metadata> => {
        const { id } = await params;
        const dao = await daoService.getDao({ urlParams: { id } });
        const daoAvatarUrl = ipfsUtils.cidToSrc(dao.avatar);
        const title = `${dao.name} | Governed on Aragon`;
        const description = dao.description;

        return this.buildMetadata(title, description, daoAvatarUrl);
    };
}

export const applicationMetadataUtils = new ApplicationMetadataUtils();
