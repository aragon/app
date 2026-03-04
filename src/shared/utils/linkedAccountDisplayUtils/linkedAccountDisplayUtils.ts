import { addressUtils } from '@aragon/gov-ui-kit';
import type { IDao, IDaoPlugin } from '@/shared/api/daoService';

class LinkedAccountDisplayUtils {
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

    getMatchingLinkedAccount(params: { dao?: IDao; plugin?: IDaoPlugin }) {
        const { dao, plugin } = params;
        const targetAddress = this.getPluginDaoAddress(plugin);

        return dao?.linkedAccounts?.find(
            (linkedAccount) =>
                linkedAccount.address.toLowerCase() === targetAddress,
        );
    }

    getPluginDisplayName(params: {
        dao?: IDao;
        plugin?: IDaoPlugin;
        groupLabel: string;
        fallbackLabel?: string;
    }): string {
        const { dao, plugin, groupLabel, fallbackLabel } = params;

        const safeFallback =
            fallbackLabel && fallbackLabel !== '' ? fallbackLabel : undefined;
        const pluginName =
            plugin?.name && plugin.name !== '' ? plugin.name : undefined;

        if (this.isNoPlugin({ plugin })) {
            return safeFallback ?? groupLabel;
        }

        if (this.isParentPlugin({ dao, plugin }) && dao?.name) {
            return dao.name;
        }

        // Try matching Linked Account name, then plugin name, then fallback/group label.
        const matchingLinkedAccountName = this.getMatchingLinkedAccountName({
            dao,
            plugin,
        });
        if (matchingLinkedAccountName) {
            return matchingLinkedAccountName;
        }

        return pluginName ?? safeFallback ?? groupLabel;
    }

    private isNoPlugin(params: { plugin?: IDaoPlugin }): boolean {
        return params.plugin == null;
    }

    private getMatchingLinkedAccountName(params: {
        dao?: IDao;
        plugin?: IDaoPlugin;
    }): string | undefined {
        return this.getMatchingLinkedAccount(params)?.name ?? undefined;
    }
}

export const linkedAccountDisplayUtils = new LinkedAccountDisplayUtils();
