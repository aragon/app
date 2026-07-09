import type { ProposalStatus } from '@aragon/gov-ui-kit';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { type IProposal, useProposalBySlug } from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';

export interface IUseIndexedProposalStatusParams {
    /**
     * ID of the DAO to fetch the indexed proposal from.
     */
    daoId: string;
    /**
     * Fallback status to show before indexing and while the indexed proposal is loading.
     */
    fallbackStatus: ProposalStatus;
    /**
     * Whether the transaction indexing signal has fired.
     */
    isIndexed: boolean;
    /**
     * Slug of the indexed proposal.
     */
    slug?: string;
}

export const useIndexedProposalStatus = (
    params: IUseIndexedProposalStatusParams,
): ProposalStatus => {
    const { daoId, fallbackStatus, isIndexed, slug } = params;

    const isFetchEnabled = isIndexed && slug != null;
    const indexedProposalParams = {
        urlParams: { slug: slug ?? '' },
        queryParams: { daoId },
    };
    const { data: indexedProposal, isFetchedAfterMount } = useProposalBySlug(
        indexedProposalParams,
        {
            enabled: isFetchEnabled,
            refetchOnMount: 'always',
            staleTime: 0,
        },
    );

    const hasFreshIndexedProposal = isFetchEnabled && isFetchedAfterMount;
    const proposalForStatus = hasFreshIndexedProposal
        ? indexedProposal
        : undefined;
    // When there is no fresh proposal, pluginId is '' so no status handler is registered/invoked
    // and the call is a no-op — params is genuinely optional here, so it stays undefined-typed.
    const indexedProposalStatus = useSlotSingleFunction<
        IProposal | undefined,
        ProposalStatus
    >({
        params: proposalForStatus,
        slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
        pluginId: proposalForStatus?.pluginInterfaceType ?? '',
    });

    if (!hasFreshIndexedProposal || indexedProposalStatus == null) {
        return fallbackStatus;
    }

    return indexedProposalStatus;
};
