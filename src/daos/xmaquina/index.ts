import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { xmaquinaDomains } from './domains';

export const initialiseXmaquina = () => {
    for (const domain of xmaquinaDomains) {
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
