import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { TokenMemberList } from './components/tokenMemberList';
import { plugin } from './constants/plugin';

export const initialiseTokenPlugin = () => {
    pluginRegistryUtils.registerSlotComponent({
        slotId: GovernanceSlotId.GOVERNANCE_DAO_MEMBER_LIST,
        pluginId: plugin.id,
        component: TokenMemberList,
    });
};
