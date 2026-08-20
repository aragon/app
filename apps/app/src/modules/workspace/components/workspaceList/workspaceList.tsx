import {
    Card,
    CardEmptyState,
    DateFormat,
    formatterUtils,
    Heading,
    Link,
} from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type { IWorkspace } from '../../api/workspaceService';
import { WorkspaceStatusTag } from '../workspaceStatusTag';

export interface IWorkspaceListProps {
    /**
     * Workspaces to display.
     */
    workspaces: IWorkspace[];
}

export const WorkspaceList: React.FC<IWorkspaceListProps> = (props) => {
    const { workspaces } = props;

    const { t } = useTranslations();

    if (workspaces.length === 0) {
        return (
            <CardEmptyState
                description={t('app.workspace.workspaceList.empty.description')}
                heading={t('app.workspace.workspaceList.empty.heading')}
                objectIllustration={{ object: 'SETTINGS' }}
            />
        );
    }

    return (
        <div className="flex w-full flex-col items-stretch gap-6">
            {workspaces.map((workspace) => (
                <Card
                    className="flex flex-col gap-4 p-6 md:p-8"
                    key={workspace.id}
                >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <Heading size="h2">{workspace.name}</Heading>
                        <WorkspaceStatusTag status={workspace.status} />
                    </div>
                    <p className="text-base text-neutral-500">
                        {t('app.workspace.workspaceList.summary', {
                            network: networkDefinitions[workspace.network].name,
                            targets: workspace.targets,
                            created: formatterUtils.formatDate(
                                workspace.createdAt,
                                { format: DateFormat.YEAR_MONTH_DAY },
                            ),
                        })}
                    </p>
                    <Link
                        className="w-fit"
                        href={`/workspaces/${workspace.id}`}
                    >
                        {t('app.workspace.workspaceList.action')}
                    </Link>
                </Card>
            ))}
        </div>
    );
};
