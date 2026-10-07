import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { SafeMemberPanel } from './components/safeMemberPanel';
import { SafeMultisigProposalVotingBreakdown } from './components/safeMultisigProposalVotingBreakdown';
import { SafeMultisigProposalVotingSummary } from './components/safeMultisigProposalVotingSummary';
import { SafeMultisigSubmitVote } from './components/safeMultisigSubmitVote';
import { SafeMultisigVoteList } from './components/safeMultisigVoteList';
import { SafeProcessOverview } from './components/safeProcessOverview';
import { SafeProcessSelector } from './components/safeProcessSelector';
import { safeBodyHiddenTabs, safeProcessPlugin } from './constants';
import { useSafeMultisigGovernanceSettings } from './hooks/useSafeMultisigGovernanceSettings';
import { useSafeMultisigVotePermissionCheck } from './hooks/useSafeMultisigVotePermissionCheck';
import { useSafeProcessPermissionCheckProposalCreation } from './hooks/useSafeProcessPermissionCheckProposalCreation';

export const initialiseSafeMultisigPlugin = () => {
    pluginRegistryUtils
        .registerPlugin(safeProcessPlugin)
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_SELECT_PLUGIN_PROCESS_LIST_ITEM,
            pluginId: safeProcessPlugin.id,
            component: SafeProcessSelector,
        })
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
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN,
            pluginId: safeProcessPlugin.id,
            component: SafeMultisigProposalVotingBreakdown,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_MULTI_BODY_SUMMARY,
            pluginId: safeProcessPlugin.id,
            component: SafeMultisigProposalVotingSummary,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_SUBMIT_VOTE,
            pluginId: safeProcessPlugin.id,
            component: SafeMultisigSubmitVote,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_VOTE_LIST,
            pluginId: safeProcessPlugin.id,
            component: SafeMultisigVoteList,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_HIDDEN_TABS,
            pluginId: safeProcessPlugin.id,
            function: () => safeBodyHiddenTabs,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_BODY_VOTES_AFTER_WINDOW,
            pluginId: safeProcessPlugin.id,
            function: () => true,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_VOTE_SUBMISSION,
            pluginId: safeProcessPlugin.id,
            function: useSafeMultisigVotePermissionCheck,
        });
};
