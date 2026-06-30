import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { ExecuteSelectorConditionSlot } from './components/executeSelectorConditionSlot';
import { NoConditionSlot } from './components/noConditionSlot';
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

    it.each([
        { pluginId: 'none' },
        { pluginId: 'unknown' },
    ])('does not resolve a component for the unregistered $pluginId condition type', ({
        pluginId,
    }) => {
        const resolved = pluginRegistryUtils.getSlotComponent({
            slotId: SettingsSlotId.PERMISSION_CONDITION,
            pluginId,
        });

        expect(resolved).toBeUndefined();
        expect(resolved).not.toBe(NoConditionSlot);
    });
});
