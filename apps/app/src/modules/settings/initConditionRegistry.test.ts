import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { ExecuteSelectorConditionSlot } from './components/executeSelectorConditionSlot';
import { MembershipConditionSlot } from './components/membershipConditionSlot';
import { NoConditionSlot } from './components/noConditionSlot';
import { UnrecognizedConditionSlot } from './components/unrecognizedConditionSlot';
import { VotingPowerConditionSlot } from './components/votingPowerConditionSlot';
import { initialiseConditionRegistry } from './initConditionRegistry';

describe('initialiseConditionRegistry', () => {
    beforeEach(() => {
        initialiseConditionRegistry();
    });

    it.each([
        { pluginId: 'voting-power', component: VotingPowerConditionSlot },
        {
            pluginId: 'execute-selector',
            component: ExecuteSelectorConditionSlot,
        },
        { pluginId: 'membership', component: MembershipConditionSlot },
        { pluginId: 'unknown', component: UnrecognizedConditionSlot },
        { pluginId: 'none', component: NoConditionSlot },
    ])('resolves the $pluginId condition component from the slot', ({
        pluginId,
        component,
    }) => {
        const resolved = pluginRegistryUtils.getSlotComponent({
            slotId: SettingsSlotId.PERMISSION_CONDITION,
            pluginId,
        });

        expect(resolved).toBe(component);
    });
});
