import { CardEmptyState } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceTarget } from '../../api/workspaceService';
import { WorkspaceTargetItem } from './workspaceTargetItem';

export interface IWorkspaceTargetListProps {
    /**
     * Targets to display.
     */
    targets: IWorkspaceTarget[];
    /**
     * Chain ID used to build the block explorer links.
     */
    chainId?: number;
}

export const WorkspaceTargetList: React.FC<IWorkspaceTargetListProps> = (
    props,
) => {
    const { targets, chainId } = props;

    const { t } = useTranslations();

    if (targets.length === 0) {
        return (
            <CardEmptyState
                description={t(
                    'app.workspace.workspaceTargetList.empty.description',
                )}
                heading={t('app.workspace.workspaceTargetList.empty.heading')}
                objectIllustration={{ object: 'SETTINGS' }}
            />
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {targets.map((target) => (
                <WorkspaceTargetItem
                    chainId={chainId}
                    key={target.address}
                    target={target}
                />
            ))}
        </div>
    );
};
