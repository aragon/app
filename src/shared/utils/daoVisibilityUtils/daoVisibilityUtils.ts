import type { IDaoOverride } from '@/modules/explore/api/cmsService';
import type { IDaoPlugin } from '@/shared/api/daoService';

/**
 * Utility class for DAO visibility operations.
 */
class DaoVisibilityUtils {
    /**
     * Removes plugins whose addresses appear in the DAO override's `pluginsToHide` list.
     * Comparison is case-insensitive.
     */
    filterHiddenPlugins = (
        plugins: IDaoPlugin[],
        override: IDaoOverride | undefined,
    ): IDaoPlugin[] => {
        const hiddenPlugins = override?.pluginsToHide;

        if (hiddenPlugins == null || hiddenPlugins.length === 0) {
            return plugins;
        }

        const hiddenSet = new Set(
            hiddenPlugins.map((plugin) => plugin.address.toLowerCase()),
        );

        return plugins.filter(
            (plugin) => !hiddenSet.has(plugin.address.toLowerCase()),
        );
    };
}

export const daoVisibilityUtils = new DaoVisibilityUtils();
