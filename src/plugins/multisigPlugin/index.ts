import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { useMultisigPermissionCheckProposalCreation } from '@/plugins/multisigPlugin/hooks/useMultisigPermissionCheckProposalCreation';
import { useMultisigPermissionCheckVoteSubmission } from '@/plugins/multisigPlugin/hooks/useMultisigPermissionCheckVoteSubmission';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { MultisigCreateProposalSettingsForm } from './components/multisigCreateProposalSettingsForm';
import { MultisigGovernanceInfo } from './components/multisigGovernanceInfo';
import { MultisigMemberInfo } from './components/multisigMemberInfo';
import { MultisigProposalList } from './components/multisigProposalList';
import { MultisigProposalVotingBreakdown } from './components/multisigProposalVotingBreakdown';
import { MultisigProposalVotingSummary } from './components/multisigProposalVotingSummary';
import { MultisigSubmitVote } from './components/multisigSubmitVote';
import { MultisigVoteList } from './components/multisigVoteList';
import { plugin } from './constants/plugin';
import { useMultisigActions } from './hooks/useMultisigActions';
import { useMultisigGovernanceSettings } from './hooks/useMultisigGovernanceSettings';
import { useMultisigNormalizeActions } from './hooks/useMultisigNormalizeActions';
import { multisigProposalUtils } from './utils/multisigProposalUtils';
import { multisigTransactionUtils } from './utils/multisigTransactionUtils';

export const initialiseMultisigPlugin = () => {
    pluginRegistryUtils
        // Plugin definitions
        .registerPlugin(plugin)

        // Governance module slots
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_DAO_PROPOSAL_LIST,
            pluginId: plugin.id,
            component: MultisigProposalList,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN,
            pluginId: plugin.id,
            component: MultisigProposalVotingBreakdown,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_VOTE_LIST,
            pluginId: plugin.id,
            component: MultisigVoteList,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
            pluginId: plugin.id,
            function: multisigProposalUtils.getProposalStatus,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_SUCCEEDED,
            pluginId: plugin.id,
            function: multisigProposalUtils.isApprovalReached,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_CREATE_PROPOSAL_SETTINGS_FORM,
            pluginId: plugin.id,
            component: MultisigCreateProposalSettingsForm,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA,
            pluginId: plugin.id,
            function: multisigTransactionUtils.buildCreateProposalData,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_SUBMIT_VOTE,
            pluginId: plugin.id,
            component: MultisigSubmitVote,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_VOTE_DATA,
            pluginId: plugin.id,
            function: multisigTransactionUtils.buildVoteData,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PLUGIN_ACTIONS,
            pluginId: plugin.id,
            function: useMultisigActions,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PLUGIN_NORMALIZE_ACTIONS,
            pluginId: plugin.id,
            function: useMultisigNormalizeActions,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_MULTI_BODY_SUMMARY,
            pluginId: plugin.id,
            component: MultisigProposalVotingSummary,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
            pluginId: plugin.id,
            function: useMultisigPermissionCheckProposalCreation,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_VOTE_SUBMISSION,
            pluginId: plugin.id,
            function: useMultisigPermissionCheckVoteSubmission,
        })

        // Settings module slots
        .registerSlotFunction({
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
            pluginId: plugin.id,
            function: useMultisigGovernanceSettings,
        })
        .registerSlotComponent({
            slotId: SettingsSlotId.SETTINGS_MEMBERS_INFO,
            pluginId: plugin.id,
            component: MultisigMemberInfo,
        })
        .registerSlotComponent({
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_INFO,
            pluginId: plugin.id,
            component: MultisigGovernanceInfo,
        })

        // Create DAO module slots
        .registerSlotFunction({
            slotId: CreateDaoSlotId.CREATE_DAO_BUILD_PREPARE_PLUGIN_INSTALL_DATA,
            pluginId: plugin.id,
            function: multisigTransactionUtils.buildPrepareInstallData,
        });
};
