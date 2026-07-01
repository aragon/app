import { addressUtils } from '@aragon/gov-ui-kit';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { ALLOW_FLAG, ANY_ADDR } from '../../constants/permissionSentinels';

/**
 * Classifies a resolved permission entity for display purposes.
 */
export type PermissionEntityType = 'dao' | 'plugin' | 'sentinel' | 'address';

/**
 * Resolved, display-ready representation of a permission `who` / `where` entity.
 */
export interface IPermissionEntity {
    /**
     * Human-readable label for the entity (e.g. a DAO name, a plugin name, a
     * sentinel name, or a truncated address fallback).
     */
    label: string;
    /**
     * Short type tag shown next to plugin entities (e.g. `MULTISIG` / `SPP`).
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
    /**
     * Entity classification used to pick the right cell visual (avatar / tag /
     * placeholder circle).
     */
    type: PermissionEntityType;
    /**
     * Avatar source for DAO / linked-account entities.
     */
    avatarSrc?: string;
    /**
     * Secondary detail label shown under the address in the expanded row — the
     * DAO name, or the plugin metadata name and version (e.g. `Core v1.3`).
     */
    detailName?: string;
}

/**
 * Minimal DAO / linked-account reference used to resolve a permission address to
 * its owning account.
 */
export interface IPermissionAccountRef {
    address: string;
    name: string;
    avatar?: string | null;
}

type DaoPluginEntries = IFilterComponentPlugin<IDaoPlugin>[];

interface IResolvePermissionEntityOptions {
    /**
     * Installed DAO plugin entries (as returned by `useDaoPlugins`) matched
     * against the address to resolve plugin names and type tags.
     */
    daoPlugins?: DaoPluginEntries;
    /**
     * DAO and linked-account references matched against the address to resolve
     * DAO names and avatars.
     */
    accounts?: IPermissionAccountRef[];
}

class PermissionEntityUtils {
    /**
     * Resolves a permission `who` / `where` address to a display-ready entity.
     *
     * Resolution order:
     * 1. {@link ANY_ADDR} sentinel -> "Anyone".
     * 2. {@link ALLOW_FLAG} sentinel -> "Any Address".
     * 3. A matching installed DAO plugin -> the plugin name plus its interface
     *    type as an uppercase tag (e.g. `MULTISIG`) and a `name vX.Y` detail.
     * 4. A matching DAO / linked account -> the account name and avatar.
     * 5. Otherwise -> the truncated address.
     */
    resolvePermissionEntity = (
        address: string,
        options: IResolvePermissionEntityOptions = {},
    ): IPermissionEntity => {
        const { daoPlugins, accounts } = options;

        if (this.isAddressEqual(address, ANY_ADDR)) {
            return {
                label: 'Anyone',
                address,
                isSentinel: true,
                type: 'sentinel',
            };
        }

        if (this.isAddressEqual(address, ALLOW_FLAG)) {
            return {
                label: 'Any Address',
                address,
                isSentinel: true,
                type: 'sentinel',
            };
        }

        const matchedPlugin = daoPlugins?.find((plugin) =>
            this.isAddressEqual(plugin.meta.address, address),
        );

        if (matchedPlugin != null) {
            const { meta } = matchedPlugin;

            return {
                label: daoUtils.getPluginName(meta),
                tag: meta.interfaceType
                    ? daoUtils
                          .parsePluginInterfaceType(meta.interfaceType)
                          .toUpperCase()
                    : undefined,
                address,
                isSentinel: false,
                type: 'plugin',
                detailName: this.formatPluginDetail(meta),
            };
        }

        const matchedAccount = accounts?.find((account) =>
            this.isAddressEqual(account.address, address),
        );

        if (matchedAccount != null) {
            return {
                label: matchedAccount.name,
                address,
                isSentinel: false,
                type: 'dao',
                avatarSrc:
                    matchedAccount.avatar != null
                        ? ipfsUtils.cidToSrc(matchedAccount.avatar)
                        : undefined,
                detailName: matchedAccount.name,
            };
        }

        return {
            label: addressUtils.truncateAddress(address),
            address,
            isSentinel: false,
            type: 'address',
        };
    };

    private formatPluginDetail = (plugin: IDaoPlugin): string => {
        const name = daoUtils.getPluginName(plugin);
        const { release, build } = plugin;

        if (release != null && build != null) {
            return `${name} v${release}.${build}`;
        }

        return name;
    };

    private isAddressEqual = (a?: string, b?: string): boolean =>
        a != null && b != null && a.toLowerCase() === b.toLowerCase();
}

export const permissionEntityUtils = new PermissionEntityUtils();
