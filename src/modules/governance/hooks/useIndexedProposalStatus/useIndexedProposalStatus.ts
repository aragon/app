import { type ProposalStatus } from '@aragon/gov-ui-kit';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import {
    type IProposal,
    useProposalBySlug,
} from '../../api/governanceService';
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
    const { data: indexedProposal } = useProposalBySlug(indexedProposalParams, {
        enabled: isFetchEnabled,
    });

    const proposalForStatus = isFetchEnabled ? indexedProposal : undefined;
    const indexedProposalStatus = useSlotSingleFunction<
        IProposal,
        ProposalStatus
    >({
        params: proposalForStatus!,
        slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
        pluginId: proposalForStatus?.pluginInterfaceType ?? '',
    });

    if (!isIndexed || indexedProposalStatus == null) {
        return fallbackStatus;
    }

    return indexedProposalStatus;
};
