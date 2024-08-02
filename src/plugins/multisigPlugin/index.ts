import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { MultisigMemberInfo } from './components/multisigMemberInfo';
import { MultisigMemberList } from './components/multisigMemberList';
import { MultisigMembersPageDetails } from './components/multisigMembersPageDetails';
import { MultisigProposalList } from './components/multisigProposalList';
import { MultisigProposalsPageDetails } from './components/multisigProposalsPageDetails';
import { MultisigProposalVotingBreakdown } from './components/multisigProposalVotingBreakdown';
import { MultisigVoteList } from './components/multisigVoteList';
import { plugin } from './constants/plugin';
import { useMultisigGovernanceSettings } from './hooks/useMultisigGovernanceSettings';

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
            slotId: GovernanceSlotId.GOVERNANCE_MEMBERS_PAGE_DETAILS,
            pluginId: plugin.id,
            component: MultisigMembersPageDetails,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_DAO_PROPOSAL_LIST,
            pluginId: plugin.id,
            component: MultisigProposalList,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSALS_PAGE_DETAILS,
            pluginId: plugin.id,
            component: MultisigProposalsPageDetails,
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

        // Settings module slots
        .registerSlotFunction({
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
            pluginId: plugin.id,
            function: useMultisigGovernanceSettings,
        })
        .registerSlotComponent({
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_DAO_MEMBERS_INFO,
            pluginId: plugin.id,
            component: MultisigMemberInfo,
        });
};
