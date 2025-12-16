import type { BreadcrumbNode } from '@/shared/utils/daoBreadcrumbsUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { DaoAvatar, Icon, IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';

export interface IDaoBreadcrumbsProps {
    /**
     * Ordered list of breadcrumb nodes, from root DAO to the current DAO.
     * When undefined or shorter than 2 elements, nothing is rendered.
     */
    path?: BreadcrumbNode[];
}

/**
 * Simple component for displaying a DAO hierarchy as breadcrumbs.
 *
 * The actual path resolution is delegated to `daoBreadcrumbsUtils.buildDaoBreadcrumbPath`.
 */
export const DaoBreadcrumbs: React.FC<IDaoBreadcrumbsProps> = ({ path }) => {
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
