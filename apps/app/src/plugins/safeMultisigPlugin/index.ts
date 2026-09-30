import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { SafeMemberPanel } from './components/safeMemberPanel';
import { SafeMultisigProposalVotingBreakdown } from './components/safeMultisigProposalVotingBreakdown';
import { SafeMultisigProposalVotingSummary } from './components/safeMultisigProposalVotingSummary';
import { SafeMultisigSubmitVote } from './components/safeMultisigSubmitVote';
import { SafeMultisigVoteList } from './components/safeMultisigVoteList';
import { SafeProcessOverview } from './components/safeProcessOverview';
import {
    safeBodyHiddenTabs,
    safeBodyPluginId,
    safeProcessPlugin,
} from './constants';
import { useSafeMultisigGovernanceSettings } from './hooks/useSafeMultisigGovernanceSettings';
import { useSafeMultisigVotePermissionCheck } from './hooks/useSafeMultisigVotePermissionCheck';
import { useSafeProcessPermissionCheckProposalCreation } from './hooks/useSafeProcessPermissionCheckProposalCreation';

export const initialiseSafeMultisigPlugin = () => {
    pluginRegistryUtils
        .registerPlugin(safeProcessPlugin)
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_DAO_PROPOSAL_LIST,
            pluginId: safeProcessPlugin.id,
            component: SafeProcessOverview,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_MEMBER_PANEL,
            pluginId: safeProcessPlugin.id,
            component: SafeMemberPanel,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
            pluginId: safeProcessPlugin.id,
            function: useSafeProcessPermissionCheckProposalCreation,
        })
        .registerSlotFunction({
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
            pluginId: safeProcessPlugin.id,
            function: useSafeMultisigGovernanceSettings,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_MEMBER_PANEL,
            pluginId: safeBodyPluginId,
            component: SafeMemberPanel,
        })
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
            slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_VOTE_SUBMISSION,
            pluginId: safeBodyPluginId,
            function: useSafeMultisigVotePermissionCheck,
        })
        .registerSlotFunction({
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
            pluginId: safeBodyPluginId,
            function: useSafeMultisigGovernanceSettings,
        });
};
