import { governanceService } from '@/modules/governance/api/governanceService';
import type { IDaoProposalPageParams } from '@/modules/governance/types';
import { daoService } from '@/shared/api/daoService';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import type { Metadata } from 'next';

export interface IGenerateProposalMetadataParams {
    /**
     * Path parameters of proposal pages.
     */
    params: Promise<IDaoProposalPageParams>;
}

class GovernanceMetadataUtils {
    private readonly authors = [{ name: 'Aragon', url: 'https://app.aragon.org' }];

    generateProposalMetadata = async ({ params }: IGenerateProposalMetadataParams): Promise<Metadata> => {
        const { proposalSlug, id } = await params;
        const proposal = await this.getProposal(id, proposalSlug);
        const title = `${proposalSlug}: ${proposal.title}`;
        const description = proposal.description ?? '';
        const dao = await this.getDao(id);
        const daoAvatarUrl = ipfsUtils.cidToSrc(dao.avatar);

        return this.buildMetadata(title, description, daoAvatarUrl, 'article');
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

    private getProposal(daoId: string, slug: string) {
        return governanceService.getProposalBySlug({
            urlParams: { slug },
            queryParams: { daoId },
        });
    }
}

export const governanceMetadataUtils = new GovernanceMetadataUtils();
