import { ApplicationSlotId } from '@/modules/application/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { GaugeVoterPluginPages, gaugeVoterPlugin } from './constants/gaugeVoterPlugin';
import { GaugeVoterGaugesPage } from './pages/gaugeVoterGaugesPage';

export const initialiseGaugeVoterPlugin = () => {
    pluginRegistryUtils
        // Plugin definitions
        .registerPlugin(gaugeVoterPlugin)

        // Application module slots
        .registerSlotComponent({
            slotId: pluginRegistryUtils.getPageSlotId(ApplicationSlotId.APPLICATION_PLUGIN_PAGE, [GaugeVoterPluginPages.GAUGES]),
            pluginId: gaugeVoterPlugin.id,
            component: GaugeVoterGaugesPage,
        });
};
