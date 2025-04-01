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
        const { proposalSlug, id } = await params;

        const slugParams = { urlParams: { slug: proposalSlug }, queryParams: { daoId: id } };
        const proposal = await governanceService.getProposalBySlug(slugParams);

        return {
            authors: [{ name: 'Aragon', url: 'https://app.aragon.org' }],
            title: `Proposal ${proposal.incrementalId.toString()} - ${proposal.title}`,
            description: proposal.description ?? 'A governance proposal for consideration by the DAO.',
            openGraph: {
                title: `Proposal ${proposal.incrementalId.toString()} - ${proposal.title}`,
                description: proposal.description ?? 'A governance proposal for consideration by the DAO.',
                type: 'article',
            },
            twitter: {
                card: 'summary',
                title: `Proposal ${proposal.incrementalId.toString()} - ${proposal.title}`,
                description: proposal.description ?? 'A governance proposal for consideration by the DAO.',
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
