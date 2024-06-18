import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { pluginUtils } from '@/shared/utils/pluginUtils';
import { TokenMemberList } from './components/tokenMemberList';
import { plugin } from './constants/plugin';

export const initialiseTokenPlugin = () => {
    pluginUtils.registerSlotComponent({
        slotId: GovernanceSlotId.DAO_MEMBER_LIST,
        pluginId: plugin.id,
        component: TokenMemberList,
    });
};
