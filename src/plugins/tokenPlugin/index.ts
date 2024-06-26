import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { TokenMemberList } from './components/tokenMemberList';
import { TokenMembersPageDetails } from './components/tokenMembersPageDetails';
import { plugin } from './constants/plugin';

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
        });
};
