import { daoService } from '@/shared/api/daoService';
import type { IDaoPageParams } from '@/shared/types';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import type { Metadata } from 'next';

export interface IGenerateDaoMetadataParams {
    /**
     * Path parameters of DAO pages.
     */
    params: Promise<IDaoPageParams>;
}

class ApplicationMetadataUtils {
    private readonly authors = [{ name: 'Aragon', url: 'https://app.aragon.org' }];

    generateDaoMetadata = async ({ params }: IGenerateDaoMetadataParams): Promise<Metadata> => {
        const { id } = await params;
        const dao = await this.getDao(id);
        const daoAvatarUrl = ipfsUtils.cidToSrc(dao.avatar);
        const title = `${dao.name} | Governed on Aragon`;
        const description = dao.description;

        return this.buildMetadata(title, description, daoAvatarUrl);
    };

    private buildMetadata(title: string, description: string, image?: string, type: 'website' | 'article' = 'website') {
        const imageArray = image ? [image] : undefined;
        return {
            authors: this.authors,
            title,
            description,
            openGraph: { title, description, type, images: imageArray },
            twitter: { card: 'summary', site: '@AragonProject', title, description, images: imageArray },
        };
    }

    private getDao(id: string) {
        return daoService.getDao({ urlParams: { id } });
    }
}

export const applicationMetadataUtils = new ApplicationMetadataUtils();
