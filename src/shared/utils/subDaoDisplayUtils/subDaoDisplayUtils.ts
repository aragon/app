import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import { addressUtils } from '@aragon/gov-ui-kit';

class SubDaoDisplayUtils {
    getPluginDaoAddress(plugin?: IDaoPlugin): string {
        return (plugin?.daoAddress ?? plugin?.address ?? '').toLowerCase();
    }

    buildQueryParams<T extends { daoId?: string; address?: string }>(params: {
        daoId: string;
        plugin?: IDaoPlugin;
        initialQueryParams: T;
        isGroupTab: boolean;
    }): T {
        const { daoId, plugin, initialQueryParams, isGroupTab } = params;

        if (isGroupTab || plugin == null) {
            return { ...initialQueryParams, daoId, address: undefined };
        }

        return {
            ...initialQueryParams,
            daoId,
            address: plugin.daoAddress ?? plugin.address,
        };
    }

    isParentPlugin(params: { dao?: IDao; plugin?: IDaoPlugin }): boolean {
        const { dao, plugin } = params;
        const pluginDaoAddress = this.getPluginDaoAddress(plugin);
        const daoAddress = dao?.address.toLowerCase() ?? '';

        return addressUtils.isAddressEqual(pluginDaoAddress, daoAddress);
    }

    getMatchingSubDao(params: { dao?: IDao; plugin?: IDaoPlugin }) {
        const { dao, plugin } = params;
        const targetAddress = this.getPluginDaoAddress(plugin);

        return dao?.subDaos?.find((subDao) => subDao.address.toLowerCase() === targetAddress);
    }

    getPluginDisplayName(params: {
        dao?: IDao;
        plugin?: IDaoPlugin;
        groupLabel: string;
        fallbackLabel?: string;
    }): string {
        const { dao, plugin, groupLabel, fallbackLabel } = params;

        const safeFallback = fallbackLabel && fallbackLabel !== '' ? fallbackLabel : undefined;
        const pluginName = plugin?.name && plugin.name !== '' ? plugin.name : undefined;

        if (this.isNoPlugin({ plugin })) {
            return safeFallback ?? groupLabel;
        }

        if (this.isParentPlugin({ dao, plugin }) && dao?.name) {
            return dao.name;
        }

        // Try matching SubDAO name, then plugin name, then fallback/group label.
        const matchingSubDaoName = this.getMatchingSubDaoName({ dao, plugin });
        if (matchingSubDaoName) {
            return matchingSubDaoName;
        }

        return pluginName ?? safeFallback ?? groupLabel;
    }

    private isNoPlugin(params: { plugin?: IDaoPlugin }): boolean {
        return params.plugin == null;
    }

    /**
     * Filters out duplicate plugins based on their DAO address.
     * Returns a new array with only unique SubDAO addresses, preserving the first occurrence.
     *
     * @param plugins - Array of plugins with metadata to deduplicate
     * @param isGroupFilter - Function to identify group filter plugins (which should never be filtered)
     * @returns Array of plugins with duplicates removed
     */
    deduplicatePluginsByDaoAddress<T extends { meta: IDaoPlugin }>(params: {
        plugins: T[];
        isGroupFilter: (plugin: T) => boolean;
    }): T[] {
        const { plugins, isGroupFilter } = params;
        const seenDaoAddresses = new Set<string>();

        return plugins.filter((plugin) => {
            if (isGroupFilter(plugin)) {
                return true;
            }

            const pluginDaoAddress = this.getPluginDaoAddress(plugin.meta);
            if (pluginDaoAddress === '') {
                return true;
            }

            if (seenDaoAddresses.has(pluginDaoAddress)) {
                return false;
            }

            seenDaoAddresses.add(pluginDaoAddress);
            return true;
        });
    }

    private getMatchingSubDaoName(params: { dao?: IDao; plugin?: IDaoPlugin }): string | undefined {
        return this.getMatchingSubDao(params)?.name ?? undefined;
    }
}

export const subDaoDisplayUtils = new SubDaoDisplayUtils();
