import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { pluginUtils } from '@/shared/utils/pluginUtils';
import { MultisigMemberList } from './components/multisigMemberList';
import { plugin } from './constants/plugin';

pluginUtils.registerSlotComponent({
    slotId: GovernanceSlotId.DAO_MEMBER_LIST,
    pluginId: plugin.id,
    component: MultisigMemberList,
});
