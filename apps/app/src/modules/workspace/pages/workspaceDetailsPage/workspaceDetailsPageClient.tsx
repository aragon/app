'use client';

import { CardEmptyState, Toggle, ToggleGroup } from '@aragon/gov-ui-kit';
import {
    useWorkspace,
    WorkspaceStatus,
} from '@/modules/workspace/api/workspaceService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useFilterUrlParam } from '@/shared/hooks/useFilterUrlParam';
import { WorkspaceAccountList } from '../../components/workspaceAccountList';
import {
    WorkspaceMatrix,
    workspaceMatrixMaxSize,
} from '../../components/workspaceMatrix';
import { WorkspaceSignals } from '../../components/workspaceSignals';
import { WorkspaceStatusTag } from '../../components/workspaceStatusTag';
import { WorkspaceTargetList } from '../../components/workspaceTargetList';
import { workspaceUtils } from '../../utils/workspaceUtils';

export interface IWorkspaceDetailsPageClientProps {
    /**
     * ID of the workspace to display.
     */
    id: string;
}

enum WorkspaceView {
    TARGETS = 'targets',
    ACCOUNTS = 'accounts',
    MATRIX = 'matrix',
}

export const workspaceViewParam = 'workspaceview';

const settledStatuses: WorkspaceStatus[] = [
    WorkspaceStatus.READY,
    WorkspaceStatus.FAILED,
];
const pollInterval = 5000;

export const WorkspaceDetailsPageClient: React.FC<
    IWorkspaceDetailsPageClientProps
> = (props) => {
    const { id } = props;

    const { t } = useTranslations();

    // The service scans the targets in the background, keep polling until the scan settles.
    const { data: workspace, error } = useWorkspace(
        { urlParams: { workspaceId: id } },
        {
            refetchInterval: (query) => {
                const status = query.state.data?.status;

                return status != null && settledStatuses.includes(status)
                    ? false
                    : pollInterval;
            },
        },
    );

    const [view, setView] = useFilterUrlParam({
        name: workspaceViewParam,
        fallbackValue: WorkspaceView.TARGETS,
        validValues: Object.values(WorkspaceView),
        enableUrlUpdate: true,
    });

    if (error != null) {
        return (
            <Page.Error
                descriptionKey="app.workspace.workspaceDetailsPage.error.description"
                error={error}
                titleKey="app.workspace.workspaceDetailsPage.error.title"
            />
        );
    }

    if (workspace == null) {
        return null;
    }

    const accounts = workspaceUtils.getAccounts(workspace);
    const { counts, network } = workspace;
    const chainId = networkDefinitions[network].id;

    const isMatrixAvailable =
        accounts.length <= workspaceMatrixMaxSize &&
        workspace.targets.length <= workspaceMatrixMaxSize;

    const handleViewChange = (value?: string | string[]) => {
        if (typeof value === 'string') {
            setView(value);
        }
    };

    return (
        <>
            <Page.Header
                breadcrumbs={[
                    {
                        href: '/workspaces',
                        label: t(
                            'app.workspace.workspaceDetailsPage.breadcrumb',
                        ),
                    },
                    {
                        href: `/workspaces/${workspace.id}`,
                        label: workspace.name,
                    },
                ]}
                stats={[
                    {
                        value: counts.targets,
                        label: t(
                            'app.workspace.workspaceDetailsPage.stats.targets',
                        ),
                    },
                    {
                        value: counts.accounts,
                        label: t(
                            'app.workspace.workspaceDetailsPage.stats.accounts',
                        ),
                    },
                    {
                        value: counts.gates,
                        label: t(
                            'app.workspace.workspaceDetailsPage.stats.gates',
                        ),
                    },
                    {
                        value: counts.capabilities,
                        label: t(
                            'app.workspace.workspaceDetailsPage.stats.capabilities',
                        ),
                    },
                ]}
                title={workspace.name}
            />
            <Page.Content>
                <Page.Main>
                    <div className="flex flex-col gap-4">
                        <ToggleGroup
                            isMultiSelect={false}
                            onChange={handleViewChange}
                            value={view}
                        >
                            <Toggle
                                label={t(
                                    'app.workspace.workspaceDetailsPage.view.targets',
                                )}
                                value={WorkspaceView.TARGETS}
                            />
                            <Toggle
                                label={t(
                                    'app.workspace.workspaceDetailsPage.view.accounts',
                                )}
                                value={WorkspaceView.ACCOUNTS}
                            />
                            {isMatrixAvailable && (
                                <Toggle
                                    label={t(
                                        'app.workspace.workspaceDetailsPage.view.matrix',
                                    )}
                                    value={WorkspaceView.MATRIX}
                                />
                            )}
                        </ToggleGroup>
                        {view === WorkspaceView.TARGETS && (
                            <WorkspaceTargetList
                                chainId={chainId}
                                targets={workspace.targets}
                            />
                        )}
                        {view === WorkspaceView.ACCOUNTS && (
                            <WorkspaceAccountList
                                accounts={accounts}
                                chainId={chainId}
                            />
                        )}
                        {view === WorkspaceView.MATRIX &&
                            (isMatrixAvailable ? (
                                <WorkspaceMatrix
                                    accounts={accounts}
                                    targets={workspace.targets}
                                />
                            ) : (
                                <CardEmptyState
                                    description={t(
                                        'app.workspace.workspaceMatrix.tooLarge.description',
                                    )}
                                    heading={t(
                                        'app.workspace.workspaceMatrix.tooLarge.heading',
                                    )}
                                    objectIllustration={{ object: 'SETTINGS' }}
                                />
                            ))}
                    </div>
                </Page.Main>
                <Page.Aside>
                    <Page.AsideCard
                        title={t(
                            'app.workspace.workspaceDetailsPage.aside.status.title',
                        )}
                    >
                        <div className="flex flex-col items-start gap-3">
                            <WorkspaceStatusTag status={workspace.status} />
                            {workspace.error != null && (
                                <p className="text-critical-800 text-sm">
                                    {workspace.error}
                                </p>
                            )}
                            <p className="text-neutral-500 text-sm">
                                {t(
                                    'app.workspace.workspaceDetailsPage.aside.status.network',
                                    {
                                        network:
                                            networkDefinitions[network].name,
                                    },
                                )}
                            </p>
                        </div>
                    </Page.AsideCard>
                    <Page.AsideCard
                        title={t(
                            'app.workspace.workspaceDetailsPage.aside.signals.title',
                        )}
                    >
                        <WorkspaceSignals
                            accounts={accounts}
                            workspace={workspace}
                        />
                    </Page.AsideCard>
                </Page.Aside>
            </Page.Content>
        </>
    );
};
