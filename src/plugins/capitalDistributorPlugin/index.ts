import { ApplicationSlotId } from '@/modules/application/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { capitalDistributorPlugin } from './constants/capitalDistributorPlugin';
import { CapitalDistributorRewardsPage } from './pages/capitalDistributorRewardsPage';

export const initialiseCapitalDistributorPlugin = () => {
    pluginRegistryUtils
        // Plugin definitions
        .registerPlugin(capitalDistributorPlugin)

        // Application module slots
        .registerSlotComponent({
            slotId: `${ApplicationSlotId.APPLICATION_PLUGIN_PAGE}-rewards`,
            pluginId: capitalDistributorPlugin.id,
            component: CapitalDistributorRewardsPage,
        });
};
