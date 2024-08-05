import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { MultisigMemberInfo } from './components/multisigMemberInfo';
import { MultisigMemberList } from './components/multisigMemberList';
import { MultisigProposalList } from './components/multisigProposalList';
import { MultisigProposalVotingBreakdown } from './components/multisigProposalVotingBreakdown';
import { MultisigVoteList } from './components/multisigVoteList';
import { plugin } from './constants/plugin';
import { useMultisigGovernanceSettings } from './hooks/useMultisigGovernanceSettings';
import { multisigProposalUtils } from './utils/multisigProposalUtils';

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
