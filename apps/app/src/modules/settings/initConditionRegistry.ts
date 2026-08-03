import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import type { IDaoPermissionCondition } from '@/shared/api/daoService';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { ExecuteSelectorConditionSlot } from './components/executeSelectorConditionSlot';
import { MembershipConditionSlot } from './components/membershipConditionSlot';
import { NoConditionSlot } from './components/noConditionSlot';
import { UnrecognizedConditionSlot } from './components/unrecognizedConditionSlot';
import { VotingPowerConditionSlot } from './components/votingPowerConditionSlot';
import { NO_CONDITION, UNKNOWN_CONDITION } from './utils/conditionTypeUtils';

/**
 * Registers the permission-condition slot components against the
 * {@link SettingsSlotId.SETTINGS_PERMISSION_CONDITION} slot.
 *
 * Condition registration is standalone: the synthetic `conditionType`
 * discriminator (see {@link IDaoPermissionCondition}) is used as the `pluginId`, so each
 * resolved condition payload renders its matching component without coupling to
 * any real governance plugin. This module is the sole location for condition
 * registrations.
 */
export const initialiseConditionRegistry = () => {
    pluginRegistryUtils
        .registerSlotComponent({
            slotId: SettingsSlotId.SETTINGS_PERMISSION_CONDITION,
            pluginId: 'voting-power',
            component: VotingPowerConditionSlot,
        })
        .registerSlotComponent({
            slotId: SettingsSlotId.SETTINGS_PERMISSION_CONDITION,
            pluginId: 'execute-selector',
            component: ExecuteSelectorConditionSlot,
        })
        .registerSlotComponent({
            slotId: SettingsSlotId.SETTINGS_PERMISSION_CONDITION,
            pluginId: 'membership',
            component: MembershipConditionSlot,
        })
        .registerSlotComponent({
            slotId: SettingsSlotId.SETTINGS_PERMISSION_CONDITION,
            pluginId: UNKNOWN_CONDITION,
            component: UnrecognizedConditionSlot,
        })
        .registerSlotComponent({
            slotId: SettingsSlotId.SETTINGS_PERMISSION_CONDITION,
            pluginId: NO_CONDITION,
            component: NoConditionSlot,
        });
};
