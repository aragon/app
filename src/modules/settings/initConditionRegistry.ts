import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { ExecuteSelectorConditionSlot } from './components/executeSelectorConditionSlot';
import { MembershipConditionSlot } from './components/membershipConditionSlot';
import { VotingPowerConditionSlot } from './components/votingPowerConditionSlot';

/**
 * Registers the permission-condition slot components against the
 * {@link SettingsSlotId.PERMISSION_CONDITION} slot.
 *
 * Condition registration is standalone: the synthetic `conditionType`
 * discriminator (see {@link IConditionData}) is used as the `pluginId`, so each
 * resolved condition payload renders its matching component without coupling to
 * any real governance plugin. This module is the sole location for condition
 * registrations.
 */
export const initialiseConditionRegistry = () => {
    pluginRegistryUtils
        .registerSlotComponent({
            slotId: SettingsSlotId.PERMISSION_CONDITION,
            pluginId: 'voting-power',
            component: VotingPowerConditionSlot,
        })
        .registerSlotComponent({
            slotId: SettingsSlotId.PERMISSION_CONDITION,
            pluginId: 'execute-selector',
            component: ExecuteSelectorConditionSlot,
        })
        .registerSlotComponent({
            slotId: SettingsSlotId.PERMISSION_CONDITION,
            pluginId: 'membership',
            component: MembershipConditionSlot,
        });
};
