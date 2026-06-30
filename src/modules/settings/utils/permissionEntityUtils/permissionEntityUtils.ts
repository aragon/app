import { addressUtils } from '@aragon/gov-ui-kit';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ALLOW_FLAG, ANY_ADDR } from '../../constants/permissionSentinels';

/**
 * Resolved, display-ready representation of a permission `who` / `where` entity.
 */
export interface IPermissionEntity {
    /**
     * Human-readable label for the entity (e.g. a plugin name, a sentinel name,
     * or a truncated address fallback).
     */
    label: string;
    /**
     * Short type tag for the entity when it can be classified (e.g. the plugin
     * type such as `MULTISIG` / `SPP`). Undefined for plain addresses and
     * sentinels.
     */
    tag?: string;
    /**
     * The original, unmodified address that was resolved.
     */
    address: string;
    /**
     * Whether the address is an OSx permission sentinel (ANY_ADDR / ALLOW_FLAG)
     * rather than a concrete account.
     */
    isSentinel: boolean;
}

type DaoPluginEntries = IFilterComponentPlugin<IDaoPlugin>[];

class PermissionEntityUtils {
    /**
     * Resolves a permission `who` / `where` address to a display-ready entity.
     *
     * Resolution order:
     * 1. {@link ANY_ADDR} sentinel -> "Anyone".
     * 2. {@link ALLOW_FLAG} sentinel -> "Any Address".
     * 3. A matching installed DAO plugin -> the plugin name (label) plus its
     *    interface type as an uppercase tag (e.g. `MULTISIG`).
     * 4. Otherwise -> the checksummed, truncated address.
     *
     * @param address - The `who` or `where` address to resolve.
     * @param daoPlugins - Optional list of installed DAO plugin entries (as
     * returned by `useDaoPlugins`) used to match the address against a plugin.
     * @returns The resolved permission entity.
     */
    resolvePermissionEntity = (
        address: string,
        daoPlugins?: DaoPluginEntries,
    ): IPermissionEntity => {
        if (this.isAddressEqual(address, ANY_ADDR)) {
            return { label: 'Anyone', address, isSentinel: true };
        }

        if (this.isAddressEqual(address, ALLOW_FLAG)) {
            return { label: 'Any Address', address, isSentinel: true };
        }

        const matchedPlugin = daoPlugins?.find((plugin) =>
            this.isAddressEqual(plugin.meta.address, address),
        );

        if (matchedPlugin != null) {
            const { interfaceType } = matchedPlugin.meta;

            return {
                label: daoUtils.getPluginName(matchedPlugin.meta),
                tag: interfaceType
                    ? daoUtils
                          .parsePluginInterfaceType(interfaceType)
                          .toUpperCase()
                    : undefined,
                address,
                isSentinel: false,
            };
        }

        return {
            label: addressUtils.truncateAddress(address),
            address,
            isSentinel: false,
        };
    };

    private isAddressEqual = (a?: string, b?: string): boolean =>
        a != null && b != null && a.toLowerCase() === b.toLowerCase();
}

export const permissionEntityUtils = new PermissionEntityUtils();
