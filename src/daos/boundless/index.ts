import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { boundlessDomains } from './domains';

export const initialiseBoundless = () => {
    for (const domain of boundlessDomains) {
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
