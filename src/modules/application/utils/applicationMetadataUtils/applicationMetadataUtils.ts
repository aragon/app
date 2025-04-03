import { daoService } from '@/shared/api/daoService';
import type { IDaoPageParams } from '@/shared/types';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { metadataUtils } from '@/shared/utils/metadataUtils';
import type { Metadata } from 'next';

export interface IGenerateDaoMetadataParams {
    /**
     * Path parameters of DAO pages.
     */
    params: Promise<IDaoPageParams>;
}

class ApplicationMetadataUtils {
    generateDaoMetadata = async ({ params }: IGenerateDaoMetadataParams): Promise<Metadata> => {
        const { id } = await params;
        const dao = await daoService.getDao({ urlParams: { id } });

        const image = ipfsUtils.cidToSrc(dao.avatar);
        const title = dao.name;
        const description = dao.description;
        const siteName = `${dao.name} | Governed on Aragon`;

        return metadataUtils.buildMetadata({ title, description, siteName, image });
    };
}

export const applicationMetadataUtils = new ApplicationMetadataUtils();
