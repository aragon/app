import { Tag } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    WorkspaceStatus,
    WorkspaceTargetStatus,
} from '../../api/workspaceService';

export interface IWorkspaceStatusTagProps {
    /**
     * Status of the workspace or of one of its targets.
     */
    status: WorkspaceStatus | WorkspaceTargetStatus;
}

const statusVariants: Record<
    string,
    'success' | 'info' | 'warning' | 'critical'
> = {
    [WorkspaceStatus.PENDING]: 'info',
    [WorkspaceStatus.SCANNING]: 'info',
    [WorkspaceStatus.READY]: 'success',
    [WorkspaceStatus.FAILED]: 'critical',
    [WorkspaceTargetStatus.DONE]: 'success',
    [WorkspaceTargetStatus.UNDETERMINED]: 'warning',
    [WorkspaceTargetStatus.NOT_A_CONTRACT]: 'warning',
};

export const WorkspaceStatusTag: React.FC<IWorkspaceStatusTagProps> = (
    props,
) => {
    const { status } = props;

    const { t } = useTranslations();

    // Fall back to a neutral tag displaying the raw value so a status added on the service does not
    // render an untranslated key.
    const variant = statusVariants[status];
    const label = variant
        ? t(`app.workspace.workspaceStatusTag.${status}`)
        : status;

    return <Tag label={label} variant={variant ?? 'neutral'} />;
};
