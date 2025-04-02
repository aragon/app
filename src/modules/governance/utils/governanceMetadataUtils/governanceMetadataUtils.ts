import { governanceService } from '@/modules/governance/api/governanceService';
import type { IDaoProposalPageParams } from '@/modules/governance/types';
import { daoService } from '@/shared/api/daoService';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { MetadataUtils } from '@/shared/utils/metadataUtils';

import type { Metadata } from 'next';

export interface IGenerateProposalMetadataParams {
    /**
     * Path parameters of proposal pages.
     */
    params: Promise<IDaoProposalPageParams>;
}

class GovernanceMetadataUtils extends MetadataUtils {
    generateProposalMetadata = async ({ params }: IGenerateProposalMetadataParams): Promise<Metadata> => {
        const { proposalSlug, id } = await params;
        const proposal = await governanceService.getProposalBySlug({
            urlParams: { slug: proposalSlug },
            queryParams: { daoId: id },
        });
        const title = `${proposalSlug}: ${proposal.title}`;
        const description = proposal.description ?? '';
        const dao = await daoService.getDao({ urlParams: { id } });
        const daoAvatarUrl = ipfsUtils.cidToSrc(dao.avatar);

        return this.buildMetadata(title, description, daoAvatarUrl, 'article');
    };
}

export const governanceMetadataUtils = new GovernanceMetadataUtils();
