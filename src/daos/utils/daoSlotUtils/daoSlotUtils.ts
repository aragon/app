import type { GenerateDomain } from './daoSlotUtils.api';

class DaoSlotUtils {
    generateDomain: GenerateDomain = (params) => {
        const {
            configs,
            getMeta,
            getPlugin,
            getSlotComponents,
            getSlotFunctions,
        } = params;

        return configs.map((config) => ({
            plugin: getPlugin(config),
            slotComponents: getSlotComponents?.(config),
            slotFunctions: getSlotFunctions?.(config),
            meta: getMeta?.(config),
        }));
    };
}

export const daoSlotUtils = new DaoSlotUtils();
