import type { IDao, ISubDaoSummary } from '@/shared/api/daoService';

/**
 * Normalized DAO/SubDAO node used for hierarchy traversal.
 */
type HierarchyNode = Pick<IDao, 'address' | 'name' | 'avatar'> & {
    subDaos?: Array<ISubDaoSummary & { subDaos?: ISubDaoSummary[] }>;
};

/**
 * Represents a single DAO or SubDAO entry in the breadcrumbs chain.
 */
export type BreadcrumbNode = Pick<HierarchyNode, 'address' | 'name' | 'avatar'>;

/**
 * Parameters for building a DAO breadcrumbs path.
 */
export interface IBuildDaoBreadcrumbPathParams {
    /**
     * Root DAO used as the start of the hierarchy.
     */
    rootDao?: IDao;
    /**
     * Target DAO address to resolve the path for.
     */
    targetAddress?: string;
}

/**
 * Internal: converts a DAO into a traversable hierarchy node.
 */
const buildHierarchyNode = (dao: IDao): HierarchyNode => ({
    address: dao.address,
    name: dao.name,
    avatar: dao.avatar,
    subDaos: dao.subDaos as Array<
        ISubDaoSummary & { subDaos?: ISubDaoSummary[] }
    >,
});

/**
 * Internal: converts a SubDAO into a traversable hierarchy node.
 */
const buildSubDaoHierarchyNode = (subDao: ISubDaoSummary): HierarchyNode => ({
    address: subDao.address,
    name: subDao.name,
    avatar: subDao.avatar,
    subDaos: (subDao as ISubDaoSummary & { subDaos?: ISubDaoSummary[] })
        .subDaos,
});

/**
 * Internal: depth-first search for the path from the root DAO to the target address.
 * Returns the breadcrumb chain or undefined when not found.
 */
const findDaoPath = (params: {
    dao?: IDao;
    targetAddress?: string;
}): BreadcrumbNode[] | undefined => {
    const { dao, targetAddress } = params;

    if (dao == null || targetAddress == null) {
        return;
    }

    const normalizedTarget = targetAddress.toLowerCase();

    const dfs = (node: HierarchyNode): BreadcrumbNode[] | undefined => {
        if (node.address.toLowerCase() === normalizedTarget) {
            return [node];
        }

        for (const child of node.subDaos ?? []) {
            const childPath = dfs(buildSubDaoHierarchyNode(child));

            if (childPath) {
                return [node, ...childPath];
            }
        }

        return;
    };

    return dfs(buildHierarchyNode(dao));
};

class DaoBreadcrumbsUtils {
    /**
     * Builds a breadcrumbs path from the root DAO to the target address, when possible.
     *
     * @param params - Input parameters including the root DAO and target address.
     * @returns An ordered list of breadcrumb nodes from root to target, or undefined when no path exists.
     */
    buildDaoBreadcrumbPath(
        params: IBuildDaoBreadcrumbPathParams,
    ): BreadcrumbNode[] | undefined {
        const { rootDao, targetAddress } = params;

        return findDaoPath({ dao: rootDao, targetAddress });
    }
}

export const daoBreadcrumbsUtils = new DaoBreadcrumbsUtils();
