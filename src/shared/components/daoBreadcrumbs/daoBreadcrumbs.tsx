import { DaoAvatar, Icon, IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { BreadcrumbNode } from '@/shared/utils/daoBreadcrumbsUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';

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
        <div className="mt-2 flex flex-wrap items-center gap-2 text-neutral-500 leading-tight">
            {path.map((node, index) => {
                const avatarSrc = ipfsUtils.cidToSrc(node.avatar);
                const isLast = index === path.length - 1;

                return (
                    <div className="flex items-center gap-2" key={node.address}>
                        {index > 0 && (
                            <Icon
                                className="text-neutral-500"
                                icon={IconType.CHEVRON_RIGHT}
                                size="sm"
                            />
                        )}
                        <div
                            className={classNames(
                                'flex items-center gap-2 bg-neutral-0 py-1',
                                {
                                    'text-neutral-800': isLast,
                                },
                            )}
                        >
                            <DaoAvatar
                                name={node.name}
                                size="sm"
                                src={avatarSrc}
                            />
                            <p>{node.name}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
