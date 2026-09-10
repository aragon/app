import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { SafeMultisigProposalVotingBreakdown } from './components/safeMultisigProposalVotingBreakdown';
import { SafeMultisigProposalVotingSummary } from './components/safeMultisigProposalVotingSummary';
import { SafeMultisigSubmitVote } from './components/safeMultisigSubmitVote';
import { SafeMultisigVoteList } from './components/safeMultisigVoteList';
import { safeBodyHiddenTabs, safeBodyPluginId } from './constants';
import { useSafeMultisigGovernanceSettings } from './hooks/useSafeMultisigGovernanceSettings';

export const initialiseSafeMultisigPlugin = () => {
    pluginRegistryUtils
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN,
            pluginId: safeBodyPluginId,
            component: SafeMultisigProposalVotingBreakdown,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_MULTI_BODY_SUMMARY,
            pluginId: safeBodyPluginId,
            component: SafeMultisigProposalVotingSummary,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_SUBMIT_VOTE,
            pluginId: safeBodyPluginId,
            component: SafeMultisigSubmitVote,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_VOTE_LIST,
            pluginId: safeBodyPluginId,
            component: SafeMultisigVoteList,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_HIDDEN_TABS,
            pluginId: safeBodyPluginId,
            function: () => safeBodyHiddenTabs,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_BODY_VOTES_AFTER_WINDOW,
            pluginId: safeBodyPluginId,
            function: () => true,
        })
        .registerSlotFunction({
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
            pluginId: safeBodyPluginId,
            function: useSafeMultisigGovernanceSettings,
        });
};
