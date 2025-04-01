import { governanceService } from '@/modules/governance/api/governanceService';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { IProposalPageParams } from '@/shared/types';
import { invariant } from '@aragon/gov-ui-kit';
import type { Metadata } from 'next';

export interface IGenerateProposalMetadataParams {
    /**
     * Path parameters of DAO pages.
     */
    params: Promise<IProposalPageParams>;
}

class ProposalUtils {
    generateMetadata = async ({ params }: IGenerateProposalMetadataParams): Promise<Metadata> => {
        const { proposalSlug } = await params;

        const slugParams = { urlParams: { slug: proposalSlug } };
        const proposal = await governanceService.getProposalBySlug(slugParams);

        return {
            title: proposal.title,
            description: proposal.description,
            openGraph: {
                title: proposal.title,
                description: proposal.description ?? '',
                type: 'article',
            },
            twitter: {
                card: 'summary',
                title: proposal.title,
                description: proposal.description ?? '',
            },
        };
    };

    getProposalSlug = (incrementalId?: number, plugin?: IDaoPlugin): string => {
        invariant(
            incrementalId != null && plugin != null,
            'getProposalSlug: Both incrementalId and plugin must be provided.',
        );

        return `${plugin.slug}-${incrementalId.toString()}`.toUpperCase();
    };
}

export const proposalUtils = new ProposalUtils();
