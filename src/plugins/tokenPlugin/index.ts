import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { TokenProposalCreationRequirements } from '@/plugins/tokenPlugin/components/tokenProposalCreationRequirements';
import { useTokenPermissionCheckProposalCreation } from '@/plugins/tokenPlugin/hooks/useTokenPermissionCheckProposalCreation';
import { useTokenPermissionCheckVoteSubmission } from '@/plugins/tokenPlugin/hooks/useTokenPermissionCheckVoteSubmission';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { TokenCreateProposalSettingsForm } from './components/tokenCreateProposalSettingsForm';
import { TokenGovernanceInfo } from './components/tokenGovernanceInfo';
import { TokenMemberInfo } from './components/tokenMemberInfo';
import { TokenMemberList } from './components/tokenMemberList';
import { TokenProcessBodyField } from './components/tokenProcessBodyField';
import { TokenProposalList } from './components/tokenProposalList';
import { TokenProposalVotingBreakdown } from './components/tokenProposalVotingBreakdown';
import { TokenProposalVotingSummary } from './components/tokenProposalVotingSummary';
import { TokenSubmitVote } from './components/tokenSubmitVote';
import { TokenVoteList } from './components/tokenVoteList';
import { tokenPlugin } from './constants/tokenPlugin';
import { useTokenActions } from './hooks/useTokenActions';
import { useTokenGovernanceSettings } from './hooks/useTokenGovernanceSettings';
import { useTokenMemberStats } from './hooks/useTokenMemberStats';
import { useTokenNormalizeActions } from './hooks/useTokenNormalizeActions';
import { tokenProposalUtils } from './utils/tokenProposalUtils';
import { tokenTransactionUtils } from './utils/tokenTransactionUtils';

export const initialiseTokenPlugin = () => {
    pluginRegistryUtils
        // Plugin definitions
        .registerPlugin(tokenPlugin)

        // Governance module slots
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_DAO_MEMBER_LIST,
            pluginId: tokenPlugin.id,
            component: TokenMemberList,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_MEMBER_STATS,
            pluginId: tokenPlugin.id,
            function: useTokenMemberStats,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_DAO_PROPOSAL_LIST,
            pluginId: tokenPlugin.id,
            component: TokenProposalList,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN,
            pluginId: tokenPlugin.id,
            component: TokenProposalVotingBreakdown,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_VOTE_LIST,
            pluginId: tokenPlugin.id,
            component: TokenVoteList,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
            pluginId: tokenPlugin.id,
            function: tokenProposalUtils.getProposalStatus,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_SUCCEEDED,
            pluginId: tokenPlugin.id,
            function: tokenProposalUtils.hasSucceeded,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_CREATE_PROPOSAL_SETTINGS_FORM,
            pluginId: tokenPlugin.id,
            component: TokenCreateProposalSettingsForm,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA,
            pluginId: tokenPlugin.id,
            function: tokenTransactionUtils.buildCreateProposalData,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_SUBMIT_VOTE,
            pluginId: tokenPlugin.id,
            component: TokenSubmitVote,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_VOTE_DATA,
            pluginId: tokenPlugin.id,
            function: tokenTransactionUtils.buildVoteData,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PLUGIN_ACTIONS,
            pluginId: tokenPlugin.id,
            function: useTokenActions,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PLUGIN_NORMALIZE_ACTIONS,
            pluginId: tokenPlugin.id,
            function: useTokenNormalizeActions,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_MULTI_BODY_SUMMARY,
            pluginId: tokenPlugin.id,
            component: TokenProposalVotingSummary,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
            pluginId: tokenPlugin.id,
            function: useTokenPermissionCheckProposalCreation,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_VOTE_SUBMISSION,
            pluginId: tokenPlugin.id,
            function: useTokenPermissionCheckVoteSubmission,
        })

        // Settings module slots
        .registerSlotFunction({
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
            pluginId: tokenPlugin.id,
            function: useTokenGovernanceSettings,
        })
        .registerSlotComponent({
            slotId: SettingsSlotId.SETTINGS_MEMBERS_INFO,
            pluginId: tokenPlugin.id,
            component: TokenMemberInfo,
        })
        .registerSlotComponent({
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_INFO,
            pluginId: tokenPlugin.id,
            component: TokenGovernanceInfo,
        })

        // Create DAO module slots
        .registerSlotFunction({
            slotId: CreateDaoSlotId.CREATE_DAO_BUILD_PREPARE_PLUGIN_INSTALL_DATA,
            pluginId: tokenPlugin.id,
            function: tokenTransactionUtils.buildPrepareInstallData,
        })
        .registerSlotComponent({
            slotId: CreateDaoSlotId.CREATE_DAO_PROCESS_BODY_READ_FIELD,
            pluginId: tokenPlugin.id,
            component: TokenProcessBodyField,
        })
        .registerSlotComponent({
            slotId: CreateDaoSlotId.CREATE_DAO_PROPOSAL_CREATION_REQUIREMENTS,
            pluginId: tokenPlugin.id,
            component: TokenProposalCreationRequirements,
        });
};
