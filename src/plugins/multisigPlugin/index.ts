import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { MultisigCreateProposalSettingsForm } from './components/multisigCreateProposalSettingsForm';
import { MultisigMemberInfo } from './components/multisigMemberInfo';
import { MultisigMemberList } from './components/multisigMemberList';
import { MultisigProposalList } from './components/multisigProposalList';
import { MultisigProposalVotingBreakdown } from './components/multisigProposalVotingBreakdown';
import { MultisigVoteList } from './components/multisigVoteList';
import { plugin } from './constants/plugin';
import { useMultisigGovernanceSettings } from './hooks/useMultisigGovernanceSettings';
import { multisigProposalUtils } from './utils/multisigProposalUtils';
import { multisigTransactionUtils } from './utils/multisigTransactionUtils';
import { MultisigApproveProposal } from './components/multisigApproveProposal';

export const initialiseMultisigPlugin = () => {
    pluginRegistryUtils
        // Plugin definitions
        .registerPlugin(plugin)

        // Governance module slots
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_DAO_MEMBER_LIST,
            pluginId: plugin.id,
            component: MultisigMemberList,
        })
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
            slotId: GovernanceSlotId.GOVERNANCE_VOTE_OPTIONS,
            pluginId: plugin.id,
            component: MultisigApproveProposal,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_VOTE_DATA,
            pluginId: plugin.id,
            function: multisigTransactionUtils.buildVoteData,
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
        });
};
