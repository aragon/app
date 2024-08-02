import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { TokenMemberList } from './components/tokenMemberList';
import { TokenMembersPageDetails } from './components/tokenMembersPageDetails';
import { TokenProposalList } from './components/tokenProposalList';
import { TokenProposalsPageDetails } from './components/tokenProposalsPageDetails';
import { TokenProposalVotingBreakdown } from './components/tokenProposalVotingBreakdown';
import { TokenVoteList } from './components/tokenVoteList';
import { plugin } from './constants/plugin';
import { useTokenGovernanceSettings } from './hooks/useTokenGovernanceSettings';
import { useTokenMemberStats } from './hooks/useTokenMemberStats';

export const initialiseTokenPlugin = () => {
    pluginRegistryUtils
        // Plugin definitions
        .registerPlugin(plugin)

        // Governance module slots
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
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN,
            pluginId: plugin.id,
            component: TokenProposalVotingBreakdown,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_VOTE_LIST,
            pluginId: plugin.id,
            component: TokenVoteList,
        })

        // Settings module slots
        .registerSlotFunction({
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
            pluginId: plugin.id,
            function: useTokenGovernanceSettings,
        });
};
