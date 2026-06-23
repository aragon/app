import type { IDaoOverride } from '@/shared/api/cmsService';
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
        plugins: IDaoPlugin[] | undefined,
        override: IDaoOverride | undefined,
    ): IDaoPlugin[] => {
        // A DAO may have no plugins array yet — guard against the undefined case.
        const visiblePlugins = plugins ?? [];
        const hiddenPlugins = override?.pluginsToHide;

        if (hiddenPlugins == null || hiddenPlugins.length === 0) {
            return visiblePlugins;
        }

        const hiddenSet = new Set(
            hiddenPlugins.map((plugin) => plugin.address.toLowerCase()),
        );

        return visiblePlugins.filter(
            (plugin) => !hiddenSet.has(plugin.address.toLowerCase()),
        );
    };
}

export const daoVisibilityUtils = new DaoVisibilityUtils();
