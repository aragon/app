import type { Metadata } from 'next';
import { governanceService } from '@/modules/governance/api/governanceService';
import type { IDaoProposalPageParams } from '@/modules/governance/types';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { daoService } from '@/shared/api/daoService';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { metadataUtils } from '@/shared/utils/metadataUtils';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';

export interface IGenerateProposalMetadataParams {
    /**
     * Path parameters of proposal pages.
     */
    params: Promise<IDaoProposalPageParams>;
}

class GovernanceMetadataUtils {
    generateProposalMetadata = async ({
        params,
    }: IGenerateProposalMetadataParams): Promise<Metadata> => {
        try {
            const { proposalSlug, addressOrEns, network } = await params;
            const daoId = await daoUtils.resolveDaoId({
                addressOrEns,
                network,
            });
            const proposal = await governanceService.getProposalBySlug({
                urlParams: { slug: proposalSlug },
                queryParams: { daoId },
            });

            const title = proposal.title
                ? `${proposalSlug}: ${proposal.title}`
                : proposalSlug;
            const description = proposal.summary;
            const dao = await daoService.getDao({ urlParams: { id: daoId } });
            const siteName = `${dao.name} | Governed on Aragon`;
            const image = ipfsUtils.cidToSrc(dao.avatar);

            return metadataUtils.buildMetadata({
                title,
                description,
                siteName,
                image,
                type: 'article',
            });
        } catch (error: unknown) {
            // Suppress the errors that mean the URL points at nothing: the slug/address comes
            // straight from the URL, so a rejected identifier means an arbitrary URL (bots,
            // stale links, malformed slugs) — not a bug, and would flood Sentry. A refused
            // request (401/403/429) is a different story and still gets reported.
            if (
                !AragonBackendServiceError.isExpectedNotFoundError(error) &&
                !AragonBackendServiceError.isUnresolvableResourceError(error)
            ) {
                monitoringUtils.logError(error);
            }

            return metadataUtils.buildMetadata({
                title: 'Proposal not found',
                description: 'The requested proposal could not be found.',
                type: 'article',
            });
        }
    };
}

export const governanceMetadataUtils = new GovernanceMetadataUtils();
