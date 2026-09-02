import type { IWorkspaceAccountDao } from '@/modules/workspace/hooks/useWorkspaceAccountDaos';
import type {
    DaoOverridesMap,
    IFeaturedDelegates,
} from '@/shared/api/cmsService';
import {
    type IDao,
    type IDaoPlugin,
    PluginInterfaceType,
} from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { daoVisibilityUtils } from '@/shared/utils/daoVisibilityUtils';
import { pluginSortUtils } from '@/shared/utils/pluginSortUtils';

export interface IWorkspaceBodyPlugin
    extends IFilterComponentPlugin<IDaoPlugin> {
    /**
     * ID of the DAO that owns the plugin. This is the child DAO for a body installed on a linked account, and the
     * workspace account's own DAO otherwise. Member queries and the aside are scoped to it.
     */
    daoId: string;
    /**
     * Name of the owning DAO, used to qualify the label.
     */
    daoName: string;
    /**
     * ID of the workspace account this body was reached through. Equals `daoId` unless the body belongs to one of
     * that account's linked accounts.
     */
    accountDaoId: string;
}

export interface IGetWorkspaceBodyPluginsParams {
    /**
     * Workspace accounts paired with their resolved DAO data, in workspace order.
     */
    accountDaos: IWorkspaceAccountDao[];
    /**
     * CMS DAO overrides, applied per account so hidden bodies are excluded from the filter.
     */
    daoOverrides?: DaoOverridesMap;
}

export interface IWorkspaceFeaturedDelegates {
    /**
     * Featured-delegates configuration from the CMS.
     */
    config: IFeaturedDelegates;
    /**
     * Token voting body the delegates belong to.
     */
    plugin: IDaoPlugin;
    /**
     * ID of the DAO that owns the body.
     */
    daoId: string;
    /**
     * Name of the DAO that owns the body, used to qualify the label.
     */
    daoName: string;
    /**
     * ID of the workspace account the config was matched against.
     */
    accountDaoId: string;
}

export interface IGetWorkspaceFeaturedDelegatesParams {
    /**
     * Workspace accounts paired with their resolved DAO data, in workspace order.
     */
    accountDaos: IWorkspaceAccountDao[];
    /**
     * Body options of the workspace, as returned by {@link WorkspaceBodyUtils.getBodyPlugins}.
     */
    bodyPlugins: IWorkspaceBodyPlugin[];
    /**
     * Featured-delegates configurations from the CMS.
     */
    featuredDelegates: IFeaturedDelegates[];
}

/**
 * Case-insensitive address comparison.
 *
 * `addressUtils.isAddressEqual` cannot be used here: the app aliases `@aragon/gov-ui-kit` to a `'use client'` shim, so
 * calling into it during server rendering throws — and this util runs in the members Server Component to resolve which
 * body to prefetch. `daoUtils` compares plugin and DAO addresses the same way for the same reason.
 */
const isSameAddress = (left?: string, right?: string): boolean =>
    left != null && right != null && left.toLowerCase() === right.toLowerCase();

/**
 * Shortens an address for display, mirroring the kit's `truncateAddress` output. Inlined for the same reason as
 * {@link isSameAddress}.
 */
const truncateAddress = (address: string): string =>
    `${address.slice(0, 6)}…${address.slice(-4)}`;

/**
 * Display name of a DAO, falling back to its address when the metadata carries no usable name. Mirrors
 * `daoUtils.getDaoDisplayName` without reaching into the client-only kit.
 */
const getDaoLabel = (dao: Pick<IDao, 'name' | 'address'>): string => {
    const name = dao.name?.trim();

    return name != null && name !== '' ? name : truncateAddress(dao.address);
};

class WorkspaceBodyUtils {
    /**
     * Builds the body filter options of a workspace members page: every body of every account, plus every body of
     * those accounts' linked accounts.
     *
     * Labels are qualified with the name of the DAO that owns the plugin, because a workspace can surface several
     * bodies that share a name — two unnamed `admin` plugins on two different child DAOs both render as "Admin", and
     * the owning DAO is the only thing that distinguishes them.
     * @param params - Accounts to build the options for and the CMS overrides to apply.
     * @returns The body filter options, ordered by account and then by the DAO-page display order.
     */
    getBodyPlugins = (
        params: IGetWorkspaceBodyPluginsParams,
    ): IWorkspaceBodyPlugin[] => {
        const { accountDaos, daoOverrides } = params;

        return accountDaos.flatMap(({ account, dao }) => {
            if (dao == null) {
                return [];
            }

            const bodyPlugins =
                daoUtils.getDaoPlugins(dao, {
                    type: PluginType.BODY,
                    includeSubPlugins: true,
                    includeLinkedAccounts: true,
                }) ?? [];

            const visiblePlugins = daoVisibilityUtils.filterHiddenPlugins(
                bodyPlugins,
                daoOverrides?.[account.id],
            );

            const options = visiblePlugins.map((plugin) => {
                const owner = this.resolveOwnerDao(dao, plugin);

                return {
                    // The slot lookup keys off the interface type, exactly like the DAO member list does, so plugin
                    // specific member lists still take precedence over the default one.
                    id: plugin.interfaceType,
                    uniqueId: this.getBodyId(owner.daoId, plugin),
                    label: `${owner.name} · ${daoUtils.getPluginName(plugin)}`,
                    meta: plugin,
                    // Filled in by the container, mirroring how `useDaoPlugins` leaves props to its consumer.
                    props: {},
                    daoId: owner.daoId,
                    daoName: owner.name,
                    accountDaoId: dao.id,
                };
            });

            // Sorted within the account so each account's bodies keep the DAO-page order (own bodies before linked
            // account bodies, then by interface type).
            return pluginSortUtils.sortByDisplayOrder(options, {
                rootDaoAddress: dao.address,
            });
        });
    };

    /**
     * Resolves the featured-delegates configuration of every workspace account that has one.
     *
     * Unlike the DAO page equivalent, the match is made against the already visibility-filtered body list, so a
     * featured-delegates tab is never surfaced for a body the CMS hides.
     * @param params - Body options of the workspace and the CMS featured-delegates configs.
     * @returns One entry per account with a usable config, in account order.
     */
    getFeaturedDelegates = (
        params: IGetWorkspaceFeaturedDelegatesParams,
    ): IWorkspaceFeaturedDelegates[] => {
        const { accountDaos, bodyPlugins, featuredDelegates } = params;

        return accountDaos.flatMap(({ dao }) => {
            if (dao == null) {
                return [];
            }

            const config = featuredDelegates.find(
                (candidate) =>
                    candidate.network === dao.network &&
                    isSameAddress(candidate.daoAddress, dao.address),
            );

            if (config == null || config.delegates.length === 0) {
                return [];
            }

            const body = bodyPlugins.find(
                (candidate) =>
                    candidate.accountDaoId === dao.id &&
                    candidate.meta.interfaceType ===
                        PluginInterfaceType.TOKEN_VOTING &&
                    isSameAddress(candidate.meta.address, config.pluginAddress),
            );

            if (body == null) {
                return [];
            }

            return [
                {
                    config,
                    plugin: body.meta,
                    daoId: body.daoId,
                    daoName: body.daoName,
                    accountDaoId: dao.id,
                },
            ];
        });
    };

    /**
     * Stable identity of a body within a workspace, used as the URL parameter value. A plugin address is unique per
     * chain, so it is qualified with the owning DAO's network to stay unique across a multi-chain workspace.
     * @param daoId - ID of the DAO that owns the plugin.
     * @param plugin - The body plugin.
     * @returns The body identifier.
     */
    getBodyId = (
        daoId: string,
        plugin: Pick<IDaoPlugin, 'address'>,
    ): string => {
        const { network } = daoUtils.parseDaoId(daoId);

        return `${network}-${plugin.address}`;
    };

    /**
     * Resolves which DAO a body plugin belongs to: the account's own DAO, or one of its linked accounts.
     */
    private resolveOwnerDao = (
        dao: IDao,
        plugin: IDaoPlugin,
    ): { daoId: string; name: string } => {
        const { daoAddress } = plugin;

        if (daoAddress == null || isSameAddress(daoAddress, dao.address)) {
            return { daoId: dao.id, name: getDaoLabel(dao) };
        }

        const linkedAccount = dao.linkedAccounts?.find((candidate) =>
            isSameAddress(candidate.address, daoAddress),
        );

        if (linkedAccount != null) {
            return {
                daoId: linkedAccount.id,
                name: getDaoLabel(linkedAccount),
            };
        }

        // The plugin targets an address that is neither the account nor one of its known linked accounts. Keep the
        // body rather than dropping it, and fall back to the address as its label.
        const { network } = daoUtils.parseDaoId(dao.id);

        return {
            daoId: `${network}-${daoAddress}`,
            name: truncateAddress(daoAddress),
        };
    };
}

export const workspaceBodyUtils = new WorkspaceBodyUtils();
