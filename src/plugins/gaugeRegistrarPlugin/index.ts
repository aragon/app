import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { gaugeRegistrarPlugin } from './constants/gaugeRegistrarPlugin';
import { useGaugeRegistrarActions } from './hooks/useGaugeRegistrarActions';

export const initialiseGaugeRegistrarPlugin = () => {
    pluginRegistryUtils
        // Plugin definitions
        .registerPlugin(gaugeRegistrarPlugin)
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PLUGIN_ACTIONS,
            pluginId: gaugeRegistrarPlugin.id,
            function: useGaugeRegistrarActions,
        });
};
