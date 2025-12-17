import { ApplicationSlotId } from '@/modules/application/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { CapitalDistributorPluginPages, capitalDistributorPlugin } from './constants/capitalDistributorPlugin';
import { CapitalDistributorRewardsPage } from './pages/capitalDistributorRewardsPage';

export const initialiseCapitalDistributorPlugin = () => {
    pluginRegistryUtils
        // Plugin definitions
        .registerPlugin(capitalDistributorPlugin)

        // Application module slots
        .registerSlotComponent({
            slotId: pluginRegistryUtils.getPageSlotId(ApplicationSlotId.APPLICATION_PLUGIN_PAGE, [CapitalDistributorPluginPages.REWARDS]),
            pluginId: capitalDistributorPlugin.id,
            component: CapitalDistributorRewardsPage,
        });
};
