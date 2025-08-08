import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { TokenCreateProposalSettingsForm } from '../tokenPlugin/components/tokenCreateProposalSettingsForm';
import { TokenGovernanceInfo } from '../tokenPlugin/components/tokenGovernanceInfo';
import { TokenMemberInfo } from '../tokenPlugin/components/tokenMemberInfo';
import { TokenMemberList } from '../tokenPlugin/components/tokenMemberList';
import { TokenProposalCreationSettings } from '../tokenPlugin/components/tokenProposalCreationSettings';
import { TokenProposalVotingBreakdown } from '../tokenPlugin/components/tokenProposalVotingBreakdown';
import { TokenProposalVotingSummary } from '../tokenPlugin/components/tokenProposalVotingSummary';
import { TokenVoteList } from '../tokenPlugin/components/tokenVoteList';
import { useTokenActions } from '../tokenPlugin/hooks/useTokenActions';
import { useTokenGovernanceSettings } from '../tokenPlugin/hooks/useTokenGovernanceSettings';
import { useTokenMemberStats } from '../tokenPlugin/hooks/useTokenMemberStats';
import { useTokenNormalizeActions } from '../tokenPlugin/hooks/useTokenNormalizeActions';
import { useTokenPermissionCheckProposalCreation } from '../tokenPlugin/hooks/useTokenPermissionCheckProposalCreation';
import { tokenBodyUtils } from '../tokenPlugin/utils/tokenBodyUtils';
import { tokenProposalUtils } from '../tokenPlugin/utils/tokenProposalUtils';
import { tokenTransactionUtils } from '../tokenPlugin/utils/tokenTransactionUtils';
import { LockToVoteMemberPanel } from './components/lockToVoteMemberPanel';
import { LockToVoteProcessBodyField } from './components/lockToVoteProcessBodyField/lockToVoteProcessBodyField';
import { LockToVoteSetupGovernance } from './components/lockToVoteSetupGovernance/lockToVoteSetupGovernance';
import { LockToVoteSetupMembership } from './components/lockToVoteSetupMembership/lockToVoteSetupMembership';
import { LockToVoteSubmitVote } from './components/lockToVoteSubmitVote';
import { lockToVotePlugin } from './constants/lockToVotePlugin';
import { useLockToVotePermissionCheckVoteSubmission } from './hooks/useLockToVotePermissionCheckVoteSubmission';
import { lockToVoteTransactionUtils } from './utils/lockToVoteTransactionUtils';

export const initialiseLockToVotePlugin = () => {
    pluginRegistryUtils
        // Plugin definitions
        .registerPlugin(lockToVotePlugin)

        // Governance module slots
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_DAO_MEMBER_LIST,
            pluginId: lockToVotePlugin.id,
            component: TokenMemberList,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_MEMBER_PANEL,
            pluginId: lockToVotePlugin.id,
            component: LockToVoteMemberPanel,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_MEMBER_STATS,
            pluginId: lockToVotePlugin.id,
            function: useTokenMemberStats,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN,
            pluginId: lockToVotePlugin.id,
            component: TokenProposalVotingBreakdown,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_VOTE_LIST,
            pluginId: lockToVotePlugin.id,
            component: TokenVoteList,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
            pluginId: lockToVotePlugin.id,
            function: tokenProposalUtils.getProposalStatus,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_SUCCEEDED,
            pluginId: lockToVotePlugin.id,
            function: tokenProposalUtils.hasSucceeded,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_CREATE_PROPOSAL_SETTINGS_FORM,
            pluginId: lockToVotePlugin.id,
            component: TokenCreateProposalSettingsForm,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA,
            pluginId: lockToVotePlugin.id,
            function: lockToVoteTransactionUtils.buildCreateProposalData,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_SUBMIT_VOTE,
            pluginId: lockToVotePlugin.id,
            component: LockToVoteSubmitVote,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_VOTE_DATA,
            pluginId: lockToVotePlugin.id,
            function: lockToVoteTransactionUtils.buildVoteData,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PLUGIN_ACTIONS,
            pluginId: lockToVotePlugin.id,
            function: useTokenActions,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PLUGIN_NORMALIZE_ACTIONS,
            pluginId: lockToVotePlugin.id,
            function: useTokenNormalizeActions,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_MULTI_BODY_SUMMARY,
            pluginId: lockToVotePlugin.id,
            component: TokenProposalVotingSummary,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
            pluginId: lockToVotePlugin.id,
            function: useTokenPermissionCheckProposalCreation,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_VOTE_SUBMISSION,
            pluginId: lockToVotePlugin.id,
            function: useLockToVotePermissionCheckVoteSubmission,
        })

        // Settings module slots
        .registerSlotFunction({
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
            pluginId: lockToVotePlugin.id,
            function: useTokenGovernanceSettings,
        })
        .registerSlotComponent({
            slotId: SettingsSlotId.SETTINGS_MEMBERS_INFO,
            pluginId: lockToVotePlugin.id,
            component: TokenMemberInfo,
        })
        .registerSlotComponent({
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_INFO,
            pluginId: lockToVotePlugin.id,
            component: TokenGovernanceInfo,
        })
        .registerSlotFunction({
            slotId: SettingsSlotId.SETTINGS_BUILD_PREPARE_PLUGIN_UPDATE_DATA,
            pluginId: lockToVotePlugin.id,
            function: tokenTransactionUtils.buildPrepareUpdateData,
        })
        .registerSlotFunction({
            slotId: SettingsSlotId.SETTINGS_PLUGIN_TO_FORM_DATA,
            pluginId: lockToVotePlugin.id,
            function: tokenBodyUtils.pluginToFormData,
        })

        // Create DAO module slots
        .registerSlotFunction({
            slotId: CreateDaoSlotId.CREATE_DAO_BUILD_PREPARE_PLUGIN_INSTALL_DATA,
            pluginId: lockToVotePlugin.id,
            function: lockToVoteTransactionUtils.buildPrepareInstallData,
        })
        .registerSlotComponent({
            slotId: CreateDaoSlotId.CREATE_DAO_PROCESS_BODY_READ_FIELD,
            pluginId: lockToVotePlugin.id,
            component: LockToVoteProcessBodyField,
        })
        .registerSlotComponent({
            slotId: CreateDaoSlotId.CREATE_DAO_PROPOSAL_CREATION_SETTINGS,
            pluginId: lockToVotePlugin.id,
            component: TokenProposalCreationSettings,
        })
        .registerSlotComponent({
            slotId: CreateDaoSlotId.CREATE_DAO_SETUP_MEMBERSHIP,
            pluginId: lockToVotePlugin.id,
            component: LockToVoteSetupMembership,
        })
        .registerSlotComponent({
            slotId: CreateDaoSlotId.CREATE_DAO_SETUP_GOVERNANCE,
            pluginId: lockToVotePlugin.id,
            component: LockToVoteSetupGovernance,
        });
};
