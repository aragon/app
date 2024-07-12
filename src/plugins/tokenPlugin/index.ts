import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { TokenMemberList } from './components/tokenMemberList';
import { TokenMembersPageDetails } from './components/tokenMembersPageDetails';
import { TokenProposalList } from './components/tokenProposalList';
import { TokenProposalsPageDetails } from './components/tokenProposalsPageDetails';
import { plugin } from './constants/plugin';
import { useTokenMemberStats } from './hooks/useMultisigMemberStats';

export const initialiseTokenPlugin = () => {
    pluginRegistryUtils
        .registerPlugin(plugin)
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_DAO_MEMBER_LIST,
            pluginId: plugin.id,
            component: TokenMemberList,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_MEMBERS_PAGE_DETAILS,
            pluginId: plugin.id,
            component: TokenMembersPageDetails,
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
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSALS_PAGE_DETAILS,
            pluginId: plugin.id,
            component: TokenProposalsPageDetails,
        });
};
