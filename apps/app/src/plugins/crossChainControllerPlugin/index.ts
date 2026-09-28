import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { crossChainControllerPlugin } from './constants/crossChainControllerPlugin';
import { useCrossChainControllerActions } from './hooks/useCrossChainControllerActions';

export const initialiseCrossChainControllerPlugin = () => {
    pluginRegistryUtils
        // Plugin definitions
        .registerPlugin(crossChainControllerPlugin)

        // Governance module slots
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PLUGIN_ACTIONS,
            pluginId: crossChainControllerPlugin.id,
            function: useCrossChainControllerActions,
        });
};
