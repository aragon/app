import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { TokenCreateProposalSettingsForm } from './components/tokenCreateProposalSettingsForm';
import { TokenGovernanceInfo } from './components/tokenGovernanceInfo';
import { TokenMemberInfo } from './components/tokenMemberInfo';
import { TokenMemberList } from './components/tokenMemberList';
import { TokenProposalList } from './components/tokenProposalList';
import { TokenProposalVotingBreakdown } from './components/tokenProposalVotingBreakdown';
import { TokenSubmitVote } from './components/tokenSubmitVote';
import { TokenVoteList } from './components/tokenVoteList';
import { plugin } from './constants/plugin';
import { useTokenActions } from './hooks/useTokenActions';
import { useTokenGovernanceSettings } from './hooks/useTokenGovernanceSettings';
import { useTokenMemberStats } from './hooks/useTokenMemberStats';
import { useTokenNormalizeActions } from './hooks/useTokenNormalizeActions';
import { tokenProposalUtils } from './utils/tokenProposalUtils';
import { tokenTransactionUtils } from './utils/tokenTransactionUtils';

export const initialiseTokenPlugin = () => {
    pluginRegistryUtils
        // Plugin definitions
        .registerPlugin(plugin)

        // Governance module slots
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_DAO_MEMBER_LIST,
            pluginId: plugin.id,
            component: TokenMemberList,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_MEMBER_STATS,
            pluginId: plugin.id,
            function: useTokenMemberStats,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_DAO_PROPOSAL_LIST,
            pluginId: plugin.id,
            component: TokenProposalList,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN,
            pluginId: plugin.id,
            component: TokenProposalVotingBreakdown,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_VOTE_LIST,
            pluginId: plugin.id,
            component: TokenVoteList,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
            pluginId: plugin.id,
            function: tokenProposalUtils.getProposalStatus,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_SUCCEEDED,
            pluginId: plugin.id,
            function: tokenProposalUtils.isApprovalReached,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_CREATE_PROPOSAL_SETTINGS_FORM,
            pluginId: plugin.id,
            component: TokenCreateProposalSettingsForm,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA,
            pluginId: plugin.id,
            function: tokenTransactionUtils.buildCreateProposalData,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_SUBMIT_VOTE,
            pluginId: plugin.id,
            component: TokenSubmitVote,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_VOTE_DATA,
            pluginId: plugin.id,
            function: tokenTransactionUtils.buildVoteData,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PLUGIN_ACTIONS,
            pluginId: plugin.id,
            function: useTokenActions,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PLUGIN_NORMALIZE_ACTIONS,
            pluginId: plugin.id,
            function: useTokenNormalizeActions,
        })

        // Settings module slots
        .registerSlotFunction({
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
            pluginId: plugin.id,
            function: useTokenGovernanceSettings,
        })
        .registerSlotComponent({
            slotId: SettingsSlotId.SETTINGS_MEMBERS_INFO,
            pluginId: plugin.id,
            component: TokenMemberInfo,
        })
        .registerSlotComponent({
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_INFO,
            pluginId: plugin.id,
            component: TokenGovernanceInfo,
        });
};
