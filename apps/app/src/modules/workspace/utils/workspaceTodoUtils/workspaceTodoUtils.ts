import type { ProposalStatus } from '@aragon/gov-ui-kit';
import type { IProposal } from '@/modules/governance/api/governanceService';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';

class WorkspaceTodoUtils {
    /**
     * Status of a proposal as its process plugin computes it, or undefined when no plugin claims the proposal's
     * interface type, which the to-do list treats as "not actionable" rather than guessing.
     */
    getProposalStatus = (proposal: IProposal): ProposalStatus | undefined => {
        const getStatus = pluginRegistryUtils.getSlotFunction<
            IProposal,
            ProposalStatus
        >({
            slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
            pluginId: proposal.pluginInterfaceType,
        });

        return getStatus?.(proposal);
    };
}

export const workspaceTodoUtils = new WorkspaceTodoUtils();
