import type { IDao, ISubDaoSummary } from '@/shared/api/daoService';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { DaoAvatar, Icon, IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';

/**
 * Normalized DAO/SubDAO node used for traversal.
 */
type HierarchyNode = Pick<IDao, 'address' | 'name' | 'avatar'> & {
    subDaos?: Array<ISubDaoSummary & { subDaos?: ISubDaoSummary[] }>;
};

export type BreadcrumbNode = Pick<HierarchyNode, 'address' | 'name' | 'avatar'>;

/**
 * Converts a DAO into a traversable hierarchy node.
 */
const buildHierarchyNode = (dao: IDao): HierarchyNode => ({
    address: dao.address,
    name: dao.name,
    avatar: dao.avatar,
    subDaos: dao.subDaos as Array<ISubDaoSummary & { subDaos?: ISubDaoSummary[] }>,
});

/**
 * Converts a SubDAO into a traversable hierarchy node.
 */
const buildSubDaoHierarchyNode = (subDao: ISubDaoSummary): HierarchyNode => ({
    address: subDao.address,
    name: subDao.name,
    avatar: subDao.avatar,
    subDaos: (subDao as ISubDaoSummary & { subDaos?: ISubDaoSummary[] }).subDaos,
});

/**
 * Depth-first search for the path from the root DAO to the target address.
 * Returns the breadcrumb chain or undefined when not found.
 */
const findDaoPath = (params: { dao?: IDao; targetAddress?: string }): BreadcrumbNode[] | undefined => {
    const { dao, targetAddress } = params;

    if (dao == null || targetAddress == null) {
        return undefined;
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

        return undefined;
    };

    return dfs(buildHierarchyNode(dao));
};

interface IDaoBreadcrumbsProps {
    path?: BreadcrumbNode[];
}

export const DaoBreadcrumbs = ({ path }: IDaoBreadcrumbsProps) => {
    if (path == null || path.length <= 1) {
        return null;
    }

    return (
        <div className="mt-2 flex flex-wrap items-center gap-2 leading-tight text-neutral-500">
            {path.map((node, index) => {
                const avatarSrc = ipfsUtils.cidToSrc(node.avatar);
                const isLast = index === path.length - 1;

                return (
                    <div key={node.address} className="flex items-center gap-2">
                        {index > 0 && <Icon icon={IconType.CHEVRON_RIGHT} size="sm" className="text-neutral-500" />}
                        <div
                            className={classNames('bg-neutral-0 flex items-center gap-2 py-1', {
                                'text-neutral-800': isLast,
                            })}
                        >
                            <DaoAvatar src={avatarSrc} name={node.name} size="sm" />
                            <p>{node.name}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export const buildDaoBreadcrumbPath = (params: { rootDao?: IDao; targetAddress?: string }) =>
    findDaoPath({ dao: params.rootDao, targetAddress: params.targetAddress });
