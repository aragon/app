import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { SafeMultisigProposalVotingBreakdown } from './components/safeMultisigProposalVotingBreakdown';
import { safeBodyPluginId } from './constants';

export const initialiseSafeMultisigPlugin = () => {
    pluginRegistryUtils.registerSlotComponent({
        slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN,
        pluginId: safeBodyPluginId,
        component: SafeMultisigProposalVotingBreakdown,
    });
};
