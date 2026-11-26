import {
    addressEntryKey,
    type IAddressEntry,
    validateName,
} from '@aragon/gov-ui-kit';
import type {
    IWorkspace,
    IWorkspaceAlias,
} from '@/modules/workspace/api/workspaceService';
import type { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import { networkUtils } from '@/shared/utils/networkUtils';

class AddressBookUtils {
    /**
     * Chain id of a stored network, as used in the keys of the address book: `0` for all networks (`null`), undefined
     * for a network the app no longer knows.
     */
    getChainId = (network: Network | null): number | undefined => {
        if (network === null) {
            return 0;
        }

        return networkUtils.isValidNetwork(network)
            ? networkDefinitions[network].id
            : undefined;
    };

    /**
     * Chain id of the network a page is about: the network of a DAO route, or the one in the account ID of a
     * workspace account route (`{network}-{address}`). Undefined elsewhere, e.g. on the all-accounts pages, and for a
     * network the app does not know, since the route is parsed, not validated.
     */
    getRouteChainId = (params: {
        network?: string;
        accountId?: string;
    }): number | undefined => {
        const { network, accountId } = params;
        const routeNetwork =
            network ??
            (accountId == null
                ? undefined
                : daoUtils.parseDaoId(accountId).network);

        return routeNetwork == null
            ? undefined
            : this.getChainId(routeNetwork as Network);
    };

    /**
     * Builds the entries the kit reads, in one pass over the workspaces: the own names of the current workspace (the route's,
     * else the first by name), its
     * accounts (bound to their network, only the names stored with the workspace), then the names of the other
     * workspaces (the most recently updated wins, ties go to the lowest workspace ID). When names share a key, the
     * first of that order stays. Every stored name is checked with `validateName` each time, so a name that fails the
     * rules is left out whatever way it was stored.
     */
    buildEntries = (
        workspaces: IWorkspace[],
        currentWorkspaceId?: string,
    ): ReadonlyMap<string, IAddressEntry> => {
        const entries = new Map<string, IAddressEntry>();
        const current = this.getCurrentWorkspace(
            workspaces,
            currentWorkspaceId,
        );

        for (const alias of this.readAliases(current)) {
            this.addOnce(entries, alias, {
                label: alias.name,
                source: 'workspace',
            });
        }

        for (const account of current?.accounts ?? []) {
            const name = account.metadata?.name;
            const chainId = this.getChainId(account.network);

            if (
                typeof name === 'string' &&
                chainId != null &&
                validateName(name).ok
            ) {
                this.addKey(
                    entries,
                    addressEntryKey(account.address, chainId),
                    {
                        label: name,
                        source: 'known-account',
                        networkLabel: networkDefinitions[account.network].name,
                    },
                );
            }
        }

        const others = workspaces
            .filter((workspace) => workspace !== current)
            .flatMap((workspace) =>
                this.readAliases(workspace).map((alias) => ({
                    workspace,
                    alias,
                })),
            )
            .sort(
                (x, y) =>
                    y.alias.updatedAt - x.alias.updatedAt ||
                    (x.workspace.id < y.workspace.id
                        ? -1
                        : x.workspace.id > y.workspace.id
                          ? 1
                          : 0),
            );

        for (const { workspace, alias } of others) {
            this.addOnce(entries, alias, {
                label: alias.name,
                source: 'other-workspace',
                sourceLabel: workspace.name,
            });
        }

        return entries;
    };

    // The workspace of the route. Pages with no workspace in the URL, or an unknown one, have no better answer than the
    // first workspace by name (then ID): the app keeps no record of the last used one.
    private getCurrentWorkspace = (
        workspaces: IWorkspace[],
        currentWorkspaceId?: string,
    ) =>
        workspaces.find((workspace) => workspace.id === currentWorkspaceId) ??
        [...workspaces].sort(
            (x, y) =>
                Number(x.name > y.name) - Number(x.name < y.name) ||
                Number(x.id > y.id) - Number(x.id < y.id),
        )[0];

    // The aliases of a stored workspace that can be used: well-formed, with a known network and a name that passes.
    private readAliases = (workspace?: IWorkspace): IWorkspaceAlias[] => {
        const aliases: unknown = workspace?.aliases;

        if (!Array.isArray(aliases)) {
            return [];
        }

        return aliases.filter(
            (alias): alias is IWorkspaceAlias =>
                alias != null &&
                typeof alias.address === 'string' &&
                typeof alias.name === 'string' &&
                typeof alias.updatedAt === 'number' &&
                this.getChainId(alias.network) != null &&
                validateName(alias.name).ok,
        );
    };

    private addOnce = (
        entries: Map<string, IAddressEntry>,
        alias: IWorkspaceAlias,
        entry: IAddressEntry,
    ) => {
        const chainId = this.getChainId(alias.network);

        if (chainId == null) {
            return;
        }

        const bound =
            alias.network == null
                ? {}
                : { networkLabel: networkDefinitions[alias.network].name };
        this.addKey(entries, addressEntryKey(alias.address, chainId), {
            ...entry,
            ...bound,
        });
    };

    private addKey = (
        entries: Map<string, IAddressEntry>,
        key: string,
        entry: IAddressEntry,
    ) => {
        if (!entries.has(key)) {
            entries.set(key, entry);
        }
    };
}

export const addressBookUtils = new AddressBookUtils();
