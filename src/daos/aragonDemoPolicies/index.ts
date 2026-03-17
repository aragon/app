import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { aragonDemoPoliciesDomains } from './domains';

export const initialiseAragonDemoPolicies = () => {
    for (const domain of aragonDemoPoliciesDomains) {
        pluginRegistryUtils.registerPlugin(domain.plugin);

        for (const slotComponent of domain.slotComponents ?? []) {
            pluginRegistryUtils.registerSlotComponent({
                slotId: slotComponent.slotId,
                pluginId: domain.plugin.id,
                component: slotComponent.component,
            });
        }
    }
};
