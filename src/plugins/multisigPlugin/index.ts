import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { useMultisigPermissionCheckProposalCreation } from '@/plugins/multisigPlugin/hooks/useMultisigPermissionCheckProposalCreation';
import { useMultisigPermissionCheckVoteSubmission } from '@/plugins/multisigPlugin/hooks/useMultisigPermissionCheckVoteSubmission';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { MultisigCreateProposalSettingsForm } from './components/multisigCreateProposalSettingsForm';
import { MultisigGovernanceInfo } from './components/multisigGovernanceInfo';
import { MultisigMemberInfo } from './components/multisigMemberInfo';
import { MultisigProcessBodyField } from './components/multisigProcessBodyField';
import { MultisigProposalList } from './components/multisigProposalList';
import { MultisigProposalVotingBreakdown } from './components/multisigProposalVotingBreakdown';
import { MultisigProposalVotingSummary } from './components/multisigProposalVotingSummary';
import { MultisigSubmitVote } from './components/multisigSubmitVote';
import { MultisigVoteList } from './components/multisigVoteList';
import { MultisigVotingBodyCheckboxCard } from './components/multisigVotingBodyCheckboxCard';
import { multisigPlugin } from './constants/multisigPlugin';
import { useMultisigActions } from './hooks/useMultisigActions';
import { useMultisigGovernanceSettings } from './hooks/useMultisigGovernanceSettings';
import { useMultisigNormalizeActions } from './hooks/useMultisigNormalizeActions';
import { multisigProposalUtils } from './utils/multisigProposalUtils';
import { multisigTransactionUtils } from './utils/multisigTransactionUtils';

export const initialiseMultisigPlugin = () => {
    pluginRegistryUtils
        // Plugin definitions
        .registerPlugin(multisigPlugin)

        // Governance module slots
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_DAO_PROPOSAL_LIST,
            pluginId: multisigPlugin.id,
            component: MultisigProposalList,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN,
            pluginId: multisigPlugin.id,
            component: MultisigProposalVotingBreakdown,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_VOTE_LIST,
            pluginId: multisigPlugin.id,
            component: MultisigVoteList,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
            pluginId: multisigPlugin.id,
            function: multisigProposalUtils.getProposalStatus,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_SUCCEEDED,
            pluginId: multisigPlugin.id,
            function: multisigProposalUtils.isApprovalReached,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_CREATE_PROPOSAL_SETTINGS_FORM,
            pluginId: multisigPlugin.id,
            component: MultisigCreateProposalSettingsForm,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA,
            pluginId: multisigPlugin.id,
            function: multisigTransactionUtils.buildCreateProposalData,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_SUBMIT_VOTE,
            pluginId: multisigPlugin.id,
            component: MultisigSubmitVote,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_VOTE_DATA,
            pluginId: multisigPlugin.id,
            function: multisigTransactionUtils.buildVoteData,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PLUGIN_ACTIONS,
            pluginId: multisigPlugin.id,
            function: useMultisigActions,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PLUGIN_NORMALIZE_ACTIONS,
            pluginId: multisigPlugin.id,
            function: useMultisigNormalizeActions,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_MULTI_BODY_SUMMARY,
            pluginId: multisigPlugin.id,
            component: MultisigProposalVotingSummary,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
            pluginId: multisigPlugin.id,
            function: useMultisigPermissionCheckProposalCreation,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_VOTE_SUBMISSION,
            pluginId: multisigPlugin.id,
            function: useMultisigPermissionCheckVoteSubmission,
        })

        // Settings module slots
        .registerSlotFunction({
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
            pluginId: multisigPlugin.id,
            function: useMultisigGovernanceSettings,
        })
        .registerSlotComponent({
            slotId: SettingsSlotId.SETTINGS_MEMBERS_INFO,
            pluginId: multisigPlugin.id,
            component: MultisigMemberInfo,
        })
        .registerSlotComponent({
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_INFO,
            pluginId: multisigPlugin.id,
            component: MultisigGovernanceInfo,
        })

        // Create DAO module slots
        .registerSlotFunction({
            slotId: CreateDaoSlotId.CREATE_DAO_BUILD_PREPARE_PLUGIN_INSTALL_DATA,
            pluginId: multisigPlugin.id,
            function: multisigTransactionUtils.buildPrepareInstallData,
        })
        .registerSlotComponent({
            slotId: CreateDaoSlotId.CREATE_DAO_PROCESS_BODY_READ_FIELD,
            pluginId: multisigPlugin.id,
            component: MultisigProcessBodyField,
        })
        .registerSlotComponent({
            slotId: CreateDaoSlotId.CREATE_DAO_PROPOSAL_CREATION_REQUIREMENTS,
            pluginId: multisigPlugin.id,
            component: MultisigVotingBodyCheckboxCard,
        });
};
