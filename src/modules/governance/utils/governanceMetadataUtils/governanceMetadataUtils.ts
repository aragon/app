import { governanceService } from '@/modules/governance/api/governanceService';
import type { IDaoProposalPageParams } from '@/modules/governance/types';
import { daoService } from '@/shared/api/daoService';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { metadataUtils } from '@/shared/utils/metadataUtils';

import { daoUtils } from '@/shared/utils/daoUtils';
import type { Metadata } from 'next';

export interface IGenerateProposalMetadataParams {
    /**
     * Path parameters of proposal pages.
     */
    params: Promise<IDaoProposalPageParams>;
}

class GovernanceMetadataUtils {
    generateProposalMetadata = async ({ params }: IGenerateProposalMetadataParams): Promise<Metadata> => {
        const { proposalSlug, addressOrEns, network } = await params;
        const daoId = await daoUtils.resolveDaoId({ addressOrEns, network });
        const proposal = await governanceService.getProposalBySlug({
            urlParams: { slug: proposalSlug },
            queryParams: { daoId },
        });

        const title = `${proposalSlug}: ${proposal.title}`;
        const description = proposal.summary;
        const dao = await daoService.getDao({ urlParams: { id: daoId } });
        const siteName = `${dao.name} | Governed on Aragon`;
        const image = ipfsUtils.cidToSrc(dao.avatar);

        return metadataUtils.buildMetadata({ title, description, siteName, image, type: 'article' });
    };
}

export const governanceMetadataUtils = new GovernanceMetadataUtils();
