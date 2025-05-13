import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { TokenCreateProposalSettingsForm } from './components/tokenCreateProposalSettingsForm';
import { TokenGovernanceInfo } from './components/tokenGovernanceInfo';
import { TokenMemberInfo } from './components/tokenMemberInfo';
import { TokenMemberList } from './components/tokenMemberList';
import { TokenMemberPanel } from './components/tokenMemberPanel';
import { TokenProcessBodyField } from './components/tokenProcessBodyField';
import { TokenProposalCreationSettings } from './components/tokenProposalCreationSettings';
import { TokenProposalList } from './components/tokenProposalList';
import { TokenProposalVotingBreakdown } from './components/tokenProposalVotingBreakdown';
import { TokenProposalVotingSummary } from './components/tokenProposalVotingSummary';
import { TokenSetupGovernance } from './components/tokenSetupGovernance';
import { TokenSetupMembership } from './components/tokenSetupMembership';
import { TokenSubmitVote } from './components/tokenSubmitVote';
import { TokenVoteList } from './components/tokenVoteList';
import { tokenPlugin } from './constants/tokenPlugin';
import { useTokenActions } from './hooks/useTokenActions';
import { useTokenGovernanceSettings } from './hooks/useTokenGovernanceSettings';
import { useTokenMemberStats } from './hooks/useTokenMemberStats';
import { useTokenNormalizeActions } from './hooks/useTokenNormalizeActions';
import { useTokenPermissionCheckProposalCreation } from './hooks/useTokenPermissionCheckProposalCreation';
import { useTokenPermissionCheckVoteSubmission } from './hooks/useTokenPermissionCheckVoteSubmission';
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
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_MEMBER_PANEL,
            pluginId: tokenPlugin.id,
            component: TokenMemberPanel,
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
            slotId: CreateDaoSlotId.CREATE_DAO_PROPOSAL_CREATION_SETTINGS,
            pluginId: tokenPlugin.id,
            component: TokenProposalCreationSettings,
        })
        .registerSlotComponent({
            slotId: CreateDaoSlotId.CREATE_DAO_SETUP_MEMBERSHIP,
            pluginId: tokenPlugin.id,
            component: TokenSetupMembership,
        })
        .registerSlotComponent({
            slotId: CreateDaoSlotId.CREATE_DAO_SETUP_GOVERNANCE,
            pluginId: tokenPlugin.id,
            component: TokenSetupGovernance,
        });
};
