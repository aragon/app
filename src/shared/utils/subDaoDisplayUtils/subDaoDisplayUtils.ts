import type { IDao, IDaoPlugin } from '@/shared/api/daoService';

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
        const daoAddress = dao?.address?.toLowerCase() ?? '';

        return pluginDaoAddress !== '' && pluginDaoAddress === daoAddress;
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

        if (plugin == null) {
            return fallbackLabel ?? groupLabel;
        }

        if (plugin.id === 'all' || plugin.uniqueId === 'all' || plugin.label === groupLabel) {
            return groupLabel;
        }

        if (this.isParentPlugin({ dao, plugin }) && dao?.name) {
            return dao.name;
        }

        const matchingSubDao = this.getMatchingSubDao({ dao, plugin });
        if (matchingSubDao?.name) {
            return matchingSubDao.name;
        }

        return plugin.name ?? fallbackLabel ?? groupLabel;
    }
}

export const subDaoDisplayUtils = new SubDaoDisplayUtils();
