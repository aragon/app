import { governanceService } from '@/modules/governance/api/governanceService';
import { daoService } from '@/shared/api/daoService';
import type { IDaoPageParams, IProposalPageParams } from '@/shared/types';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import type { Metadata } from 'next';

export interface IGenerateDaoMetadataParams {
    /**
     * Path parameters of DAO pages.
     */
    params: Promise<IDaoPageParams>;
}

export interface IGenerateProposalMetadataParams {
    /**
     * Path parameters of proposal pages.
     */
    params: Promise<IProposalPageParams>;
}

class MetadataUtils {
    generateDaoMetadata = async ({ params }: IGenerateDaoMetadataParams): Promise<Metadata> => {
        const { id } = await params;
        const dao = await this.getDao(id);
        const daoAvatarUrl = ipfsUtils.cidToSrc(dao.avatar);
        const title = dao.name;
        const description = dao.description;

        return {
            authors: [{ name: 'Aragon', url: 'https://app.aragon.org' }],
            title,
            description,
            openGraph: {
                siteName: `${title} | Governed on Aragon`,
                type: 'website',
                images: daoAvatarUrl ? [daoAvatarUrl] : undefined,
            },
            twitter: { card: 'summary', site: '@AragonProject', title, description },
        };
    };

    generateProposalMetadata = async ({ params }: IGenerateProposalMetadataParams): Promise<Metadata> => {
        const { proposalSlug, id } = await params;
        const proposal = await this.getProposal(id, proposalSlug);
        const title = `${proposalSlug} - ${proposal.title}`;
        const description = proposal.description ?? '';
        const dao = await this.getDao(id);
        const daoAvatarUrl = ipfsUtils.cidToSrc(dao.avatar);

        return {
            authors: [{ name: 'Aragon', url: 'https://app.aragon.org' }],
            title,
            description,
            openGraph: { title, description, type: 'article', images: daoAvatarUrl ? [daoAvatarUrl] : undefined },
            twitter: { card: 'summary', site: '@AragonProject', title, description },
        };
    };

    private getDao(id: string) {
        return daoService.getDao({ urlParams: { id } });
    }

    private getProposal(daoId: string, slug: string) {
        return governanceService.getProposalBySlug({
            urlParams: { slug },
            queryParams: { daoId },
        });
    }
}

export const metadataUtils = new MetadataUtils();
