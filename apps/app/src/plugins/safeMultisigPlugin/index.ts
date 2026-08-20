import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { SafeMultisigProposalVotingBreakdown } from './components/safeMultisigProposalVotingBreakdown';
import { SafeMultisigSubmitVote } from './components/safeMultisigSubmitVote';
import { safeBodyPluginId } from './constants';
import { useSafeMultisigGovernanceSettings } from './hooks/useSafeMultisigGovernanceSettings';

export const initialiseSafeMultisigPlugin = () => {
    pluginRegistryUtils
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN,
            pluginId: safeBodyPluginId,
            component: SafeMultisigProposalVotingBreakdown,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_SUBMIT_VOTE,
            pluginId: safeBodyPluginId,
            component: SafeMultisigSubmitVote,
        })
        .registerSlotFunction({
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
            pluginId: safeBodyPluginId,
            function: useSafeMultisigGovernanceSettings,
        });
};
