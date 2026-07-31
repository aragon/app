import { addressUtils } from '@aragon/gov-ui-kit';
import type { IDaoPlugin, IPermissionEntityRef } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { daoUtils } from '@/shared/utils/daoUtils';
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
     * Backend entity layer, when supplied by the permissions endpoint.
     */
    layer?: IPermissionEntityRef['layer'];
    /**
     * Backend lifecycle status, when supplied by the permissions endpoint.
     */
    status?: IPermissionEntityRef['status'];
    /**
     * Avatar source for DAO / linked-account entities.
     */
    avatarSrc?: string;
    /**
     * Governance body brand identity, mirrored from the backend permission
     * entity enrichment. `safe` marks a Safe process body or external proposer.
     */
    brandId?: IPermissionEntityRef['brandId'];
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
    avatarSrc?: string;
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
    /**
     * Backend-enriched entity metadata returned with the permission row. When
     * present, this is the source of truth for labels and layers.
     */
    entity?: IPermissionEntityRef;
}

class PermissionEntityUtils {
    /**
     * Resolves a permission `who` / `where` address to a display-ready entity.
     *
     * Resolution order:
     * 1. {@link ANY_ADDR} sentinel -> "Anyone".
     * 2. {@link ALLOW_FLAG} sentinel -> "Any Address".
     * 3. Backend-enriched permission entity metadata.
     * 4. A matching installed DAO plugin -> the plugin name plus its interface
     *    type as an uppercase tag (e.g. `MULTISIG`) and a `name vX.Y` detail.
     * 5. A matching DAO / linked account -> the account name and avatar.
     * 6. Otherwise -> the truncated address.
     */
    resolvePermissionEntity = (
        address: string,
        options: IResolvePermissionEntityOptions = {},
    ): IPermissionEntity => {
        const { daoPlugins, accounts, entity } = options;

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

        if (entity != null) {
            return this.resolveBackendEntity(address, entity, daoPlugins);
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
                avatarSrc: matchedAccount.avatarSrc,
                detailName: matchedAccount.name,
            };
        }

        return {
            label: 'Unknown address',
            address,
            isSentinel: false,
            type: 'address',
            detailName: addressUtils.truncateAddress(address),
        };
    };

    private resolveBackendEntity = (
        address: string,
        entity: IPermissionEntityRef,
        daoPlugins?: DaoPluginEntries,
    ): IPermissionEntity => {
        const label =
            entity.label ??
            (entity.layer === 'contract'
                ? 'Unresolved contract'
                : 'Unknown address');
        const tag = entity.interfaceType?.toUpperCase();

        if (entity.layer === 'dao') {
            return {
                label,
                address,
                isSentinel: false,
                type: 'dao',
                avatarSrc: entity.avatarSrc,
                detailName: label,
                layer: entity.layer,
                status: entity.status,
                brandId: entity.brandId,
            };
        }

        if (entity.layer === 'processInternal') {
            const bodyInterfaceType = entity.interfaceType;
            const parsedType =
                bodyInterfaceType != null
                    ? daoUtils.parsePluginInterfaceType(bodyInterfaceType)
                    : undefined;
            const brandTag = entity.brandId === 'safe' ? 'SAFE' : undefined;
            // The backend hardcodes a generic label for bodies it cannot name.
            // Treat that as "no name" and derive a title from the interface type
            // (front-run until the backend resolves the body's real name).
            const backendName =
                entity.label != null && entity.label !== 'Process internal'
                    ? entity.label
                    : undefined;
            const bodyName =
                backendName ??
                parsedType ??
                (entity.brandId === 'safe' ? 'Safe' : label);

            return {
                label: bodyName,
                // Show a type chip only when the title is a real name — otherwise
                // the derived title already is the type and the chip is redundant.
                tag: backendName
                    ? (bodyInterfaceType?.toUpperCase() ?? brandTag)
                    : brandTag,
                address,
                isSentinel: false,
                type: 'plugin',
                detailName: entity.parentPluginName ?? bodyName,
                layer: entity.layer,
                status: entity.status,
                brandId: entity.brandId,
            };
        }

        if (
            entity.layer === 'topLevelPlugin' ||
            entity.layer === 'historicalPlugin'
        ) {
            const matchedPlugin = daoPlugins?.find((plugin) =>
                this.isAddressEqual(plugin.meta.address, address),
            );
            const backendLabelIsRawType =
                entity.interfaceType != null &&
                entity.label === entity.interfaceType;
            const pluginLabel =
                backendLabelIsRawType && matchedPlugin != null
                    ? daoUtils.getPluginName(matchedPlugin.meta)
                    : label;

            return {
                label: pluginLabel,
                tag,
                address,
                isSentinel: false,
                type: 'plugin',
                detailName:
                    matchedPlugin != null && pluginLabel !== label
                        ? this.formatPluginDetail(matchedPlugin.meta)
                        : (entity.parentPluginName ?? pluginLabel),
                layer: entity.layer,
                status: entity.status,
                brandId: entity.brandId,
            };
        }

        return {
            label,
            address,
            isSentinel: false,
            type: 'address',
            detailName: addressUtils.truncateAddress(address),
            layer: entity.layer,
            status: entity.status,
            brandId: entity.brandId,
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

    // Lenient, case-insensitive comparison. Unlike the kit's checksum-strict
    // addressUtils.isAddressEqual, this matches the OSx sentinels
    // (ANY_ADDR / ALLOW_FLAG) regardless of the casing the backend sends.
    private isAddressEqual = (a?: string, b?: string): boolean =>
        a != null && b != null && a.toLowerCase() === b.toLowerCase();
}

export const permissionEntityUtils = new PermissionEntityUtils();
