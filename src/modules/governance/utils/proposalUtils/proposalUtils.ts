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
    /**
     * Translation function.
     */
    t: (key: string, values?: Record<string, string>) => string;
}

class ProposalUtils {
    generateMetadata = async ({ params, t }: IGenerateProposalMetadataParams): Promise<Metadata> => {
        const { proposalSlug, id } = await params;

        const slugParams = { urlParams: { slug: proposalSlug }, queryParams: { daoId: id } };
        const proposal = await governanceService.getProposalBySlug(slugParams);

        return {
            authors: [{ name: 'Aragon', url: 'https://app.aragon.org' }],
            title: t('app.governance.proposalMetadata.title', {
                incrementalId: proposal.incrementalId.toString(),
                title: proposal.title,
            }),
            description: proposal.description ?? t('app.governance.proposalMetadata.defaultDescription'),
            openGraph: {
                title: proposal.title,
                description: proposal.description ?? t('app.governance.proposalMetadata.defaultDescription'),
                type: 'article',
            },
            twitter: {
                card: 'summary',
                title: proposal.title,
                description: proposal.description ?? t('app.governance.proposalMetadata.defaultDescription'),
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
