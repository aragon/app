import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { cryptexDomains } from './domains';

export const initialiseCryptex = () => {
    for (const domain of cryptexDomains) {
        pluginRegistryUtils.registerPlugin(domain.plugin);

        for (const slotComponent of domain.slotComponents ?? []) {
            pluginRegistryUtils.registerSlotComponent({
                slotId: slotComponent.slotId,
                pluginId: domain.plugin.id,
                component: slotComponent.component,
            });
        }

        for (const slotFunction of domain.slotFunctions ?? []) {
            pluginRegistryUtils.registerSlotFunction({
                slotId: slotFunction.slotId,
                pluginId: domain.plugin.id,
                function: slotFunction.fn,
            });
        }
    }
};
