import type { IDaoPlugin } from '@/shared/api/daoService';
import { invariant } from '@aragon/gov-ui-kit';

class ProposalUtils {
    getProposalUrlBySlug(incrementalId?: number, plugin?: IDaoPlugin): string {
        invariant(
            incrementalId != null && plugin != null,
            'getProposalUrlBySlug: Both incrementalId and plugin must be provided.',
        );

        return `${plugin.slug}-${incrementalId.toString()}`.toUpperCase();
    }
}

export const proposalUtils = new ProposalUtils();
