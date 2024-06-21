import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { MultisigMemberList } from './components/multisigMemberList';
import { plugin } from './constants/plugin';

export const initialiseMultisigPlugin = () => {
    pluginRegistryUtils.registerPlugin(plugin).registerSlotComponent({
        slotId: GovernanceSlotId.GOVERNANCE_DAO_MEMBER_LIST,
        pluginId: plugin.id,
        component: MultisigMemberList,
    });
};
