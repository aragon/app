import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { katanaDomains } from './domains';

export const initialiseKatana = () => {
    for (const domain of katanaDomains) {
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
