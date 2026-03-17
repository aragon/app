import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { aragonDemoDomains } from './domains';

export const initialiseAragonDemo = () => {
    for (const domain of aragonDemoDomains) {
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
