import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { MultisigMemberList } from './components/multisigMemberList';
import { MultisigMembersPageDetails } from './components/multisigMembersPageDetails';
import { MultisigProposalList } from './components/multisigProposalList';
import { MultisigProposalsPageDetails } from './components/multisigProposalsPageDetails/multisigProposalsPageDetails';
import { plugin } from './constants/plugin';
import { useMultisigMemberStats } from './hooks/useMultisigMemberStats';

export const initialiseMultisigPlugin = () => {
    pluginRegistryUtils
        .registerPlugin(plugin)
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
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_MEMBER_STATS,
            pluginId: plugin.id,
            function: useMultisigMemberStats,
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
        });
};
