import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { SafeMultisigProposalVotingBreakdown } from './components/safeMultisigProposalVotingBreakdown';
import { SafeMultisigProposalVotingSummary } from './components/safeMultisigProposalVotingSummary';
import { SafeMultisigSubmitVote } from './components/safeMultisigSubmitVote';
import { SafeMultisigVoteList } from './components/safeMultisigVoteList';
import { SafePluginInfo } from './components/safePluginInfo';
import { SafeProcessOverview } from './components/safeProcessOverview';
import { SafeProcessSelector } from './components/safeProcessSelector';
import { safeBodyHiddenTabs, safePlugin } from './constants';
import { useSafeMultisigGovernanceSettings } from './hooks/useSafeMultisigGovernanceSettings';
import { useSafeMultisigVotePermissionCheck } from './hooks/useSafeMultisigVotePermissionCheck';
import { useSafeProcessPermissionCheckProposalCreation } from './hooks/useSafeProcessPermissionCheckProposalCreation';

export const initialiseSafeMultisigPlugin = () => {
    pluginRegistryUtils
        .registerPlugin(safePlugin)
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_SELECT_PLUGIN_PROCESS_LIST_ITEM,
            pluginId: safePlugin.id,
            component: SafeProcessSelector,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_DAO_PROPOSAL_LIST,
            pluginId: safePlugin.id,
            component: SafeProcessOverview,
        })
        .registerSlotComponent({
            slotId: SettingsSlotId.SETTINGS_PLUGIN_INFO,
            pluginId: safePlugin.id,
            component: SafePluginInfo,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
            pluginId: safePlugin.id,
            function: useSafeProcessPermissionCheckProposalCreation,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN,
            pluginId: safePlugin.id,
            component: SafeMultisigProposalVotingBreakdown,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_MULTI_BODY_SUMMARY,
            pluginId: safePlugin.id,
            component: SafeMultisigProposalVotingSummary,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_SUBMIT_VOTE,
            pluginId: safePlugin.id,
            component: SafeMultisigSubmitVote,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_VOTE_LIST,
            pluginId: safePlugin.id,
            component: SafeMultisigVoteList,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_HIDDEN_TABS,
            pluginId: safePlugin.id,
            function: () => safeBodyHiddenTabs,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_BODY_VOTES_AFTER_WINDOW,
            pluginId: safePlugin.id,
            function: () => true,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_VOTE_SUBMISSION,
            pluginId: safePlugin.id,
            function: useSafeMultisigVotePermissionCheck,
        })
        .registerSlotFunction({
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
            pluginId: safePlugin.id,
            function: useSafeMultisigGovernanceSettings,
        });
};
