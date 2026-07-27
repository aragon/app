import { addressUtils } from '@aragon/gov-ui-kit';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ALLOW_FLAG, ANY_ADDR } from '../../constants/permissionSentinels';

/**
 * Classifies a resolved permission entity for display purposes.
 */
export type PermissionEntityType =
    | 'dao'
    | 'plugin'
    | 'sentinel'
    | 'condition'
    | 'processInternal'
    | 'address';

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
    avatarSrc?: string;
}

type DaoPluginEntries = IFilterComponentPlugin<IDaoPlugin>[];
export type PermissionEntityRole = 'who' | 'where' | 'condition';

interface IPermissionPluginSettings {
    stages?: Array<{
        plugins?: Array<{
            address?: string;
            proposalCreationConditionAddress?: string | null;
        }>;
    }>;
    externalProposers?: Array<{
        address?: string;
        proposalCreationConditionAddress?: string | null;
    }>;
}

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
     * Role of the address inside the permission tuple. Used only for safe,
     * unresolved fallbacks; resolved plugin/account/condition metadata wins.
     */
    role?: PermissionEntityRole;
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
        const { daoPlugins, accounts, role } = options;

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
                tag: this.getPluginTag(meta),
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

        const conditionOwner = this.findConditionOwner(address, daoPlugins);

        if (conditionOwner != null) {
            const ownerName = daoUtils.getPluginName(conditionOwner.meta);

            return {
                label: 'Condition contract',
                address,
                isSentinel: false,
                type: 'condition',
                detailName: `${ownerName} condition`,
            };
        }

        const internalOwner = this.findProcessInternalOwner(
            address,
            daoPlugins,
        );

        if (internalOwner != null) {
            const ownerName = daoUtils.getPluginName(internalOwner.meta);

            return {
                label: 'Process internal',
                tag: this.getPluginTag(internalOwner.meta),
                address,
                isSentinel: false,
                type: 'processInternal',
                detailName: `${ownerName} internal contract`,
            };
        }

        return {
            label: role === 'where' ? 'Unresolved contract' : 'Unknown address',
            address,
            isSentinel: false,
            type: 'address',
            detailName: addressUtils.truncateAddress(address),
        };
    };

    private getPluginTag = (plugin: IDaoPlugin): string | undefined =>
        plugin.interfaceType
            ? daoUtils
                  .parsePluginInterfaceType(plugin.interfaceType)
                  .toUpperCase()
            : undefined;

    private findConditionOwner = (
        address: string,
        daoPlugins?: DaoPluginEntries,
    ): IFilterComponentPlugin<IDaoPlugin> | undefined =>
        daoPlugins?.find((plugin) => {
            const { meta } = plugin;
            const settings = meta.settings as
                | IPermissionPluginSettings
                | undefined;

            return (
                this.isAddressEqual(meta.conditionAddress, address) ||
                this.isAddressEqual(
                    meta.proposalCreationConditionAddress,
                    address,
                ) ||
                settings?.stages?.some((stage) =>
                    stage.plugins?.some((stagePlugin) =>
                        this.isAddressEqual(
                            stagePlugin.proposalCreationConditionAddress ??
                                undefined,
                            address,
                        ),
                    ),
                ) === true ||
                settings?.externalProposers?.some((proposer) =>
                    this.isAddressEqual(
                        proposer.proposalCreationConditionAddress ?? undefined,
                        address,
                    ),
                ) === true
            );
        });

    private findProcessInternalOwner = (
        address: string,
        daoPlugins?: DaoPluginEntries,
    ): IFilterComponentPlugin<IDaoPlugin> | undefined =>
        daoPlugins?.find((plugin) => {
            const { meta } = plugin;
            const settings = meta.settings as
                | IPermissionPluginSettings
                | undefined;

            return (
                meta.subPlugins?.some((subPlugin) =>
                    subPlugin.addresses.some((subPluginAddress) =>
                        this.isAddressEqual(subPluginAddress, address),
                    ),
                ) === true ||
                settings?.stages?.some((stage) =>
                    stage.plugins?.some((stagePlugin) =>
                        this.isAddressEqual(stagePlugin.address, address),
                    ),
                ) === true ||
                settings?.externalProposers?.some((proposer) =>
                    this.isAddressEqual(proposer.address, address),
                ) === true
            );
        });

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
