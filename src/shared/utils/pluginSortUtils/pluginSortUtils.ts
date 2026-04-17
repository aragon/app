import { type IDaoPlugin, PluginInterfaceType } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';

export const defaultTypePriority: Record<string, number> = {
    [PluginInterfaceType.TOKEN_VOTING]: 1,
    [PluginInterfaceType.MULTISIG]: 2,
    [PluginInterfaceType.LOCK_TO_VOTE]: 3,
};

const getDefaultPriority = (typePriority: Record<string, number>) =>
    Math.max(...Object.values(typePriority)) + 1;

export interface ISortPluginsByDisplayOrderParams {
    /**
     * Address of the root DAO. Plugins matching this address are classified as
     * root-DAO plugins and sorted first. Plugins from linked accounts or with
     * `daoAddress: undefined` are sorted into the secondary group.
     */
    rootDaoAddress?: string;
    /**
     * Maps `PluginInterfaceType` values to numeric sort positions (lower = first).
     * Any type not present in the map sorts after the last explicit entry.
     * @default { tokenVoting: 1, multisig: 2, lockToVote: 3 }
     */
    typePriority?: Record<string, number>;
}

class PluginSortUtils {
    /**
     * Returns a new array of plugins sorted by display order:
     * 1. Root-DAO plugins first, then linked-account plugins.
     * 2. Within each group, sorted by interface type priority.
     *
     * Does not mutate the input array.
     */
    sortByDisplayOrder = (
        plugins: IFilterComponentPlugin<IDaoPlugin>[],
        params?: ISortPluginsByDisplayOrderParams,
    ): IFilterComponentPlugin<IDaoPlugin>[] => {
        const { rootDaoAddress, typePriority = defaultTypePriority } =
            params ?? {};

        const fallbackPriority = getDefaultPriority(typePriority);

        return [...plugins].sort((a, b) => {
            const aIsRoot = a.meta.daoAddress === rootDaoAddress;
            const bIsRoot = b.meta.daoAddress === rootDaoAddress;

            if (aIsRoot !== bIsRoot) {
                return aIsRoot ? -1 : 1;
            }

            const aPriority =
                typePriority[a.meta.interfaceType] ?? fallbackPriority;
            const bPriority =
                typePriority[b.meta.interfaceType] ?? fallbackPriority;

            return aPriority - bPriority;
        });
    };
}

export const pluginSortUtils = new PluginSortUtils();
