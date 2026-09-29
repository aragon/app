'use client';

import { Card, EmptyState, Spinner } from '@aragon/gov-ui-kit';
import type { IFeaturedDelegates } from '@/shared/api/cmsService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useWorkspace } from '../../api/workspaceService';
import { useWorkspaceAccountSelectorContext } from '../../components/workspaceAccountSelectorProvider';
import { WorkspaceDetailsPageDaoDashboard } from './workspaceDetailsPageDaoDashboard';
import { WorkspaceDetailsPageOverview } from './workspaceDetailsPageOverview';

export interface IWorkspaceDetailsPageClientProps {
    /**
     * ID of the workspace to display.
     */
    workspaceId: string;
    /**
     * Featured delegates config from CMS, forwarded to the DAO dashboard.
     */
    featuredDelegates: IFeaturedDelegates[];
}

/**
 * Routes the workspace overview to the account picked on the workspace navigation: a DAO account shows that DAO's
 * dashboard, the aggregated option shows the workspace itself — which is also the right content for a workspace
 * holding no DAO account at all.
 *
 * Resolves the workspace client-side because the mocked registry lives on local storage and is therefore not
 * readable during a server prefetch (see `docs/projectDocs/createWorkspace.md`).
 */
export const WorkspaceDetailsPageClient: React.FC<
    IWorkspaceDetailsPageClientProps
> = (props) => {
    const { workspaceId, featuredDelegates } = props;

    const { t } = useTranslations();

    const { activeOption } = useWorkspaceAccountSelectorContext();
    const activeAccount = activeOption?.account;

    const {
        data: workspace,
        isPending,
        isError,
    } = useWorkspace({ urlParams: { id: workspaceId } });

    if (isPending) {
        return (
            <Page.Main>
                <div className="flex justify-center py-20">
                    <Spinner size="lg" variant="neutral" />
                </div>
            </Page.Main>
        );
    }

    if (isError || workspace == null) {
        return (
            <Page.Main>
                <Card className="border border-neutral-100 py-10">
                    <EmptyState
                        description={t(
                            'app.workspace.workspaceDetailsPage.notFound.description',
                            { id: workspaceId },
                        )}
                        heading={t(
                            'app.workspace.workspaceDetailsPage.notFound.title',
                        )}
                        objectIllustration={{ object: 'MAGNIFYING_GLASS' }}
                    />
                </Card>
            </Page.Main>
        );
    }

    // Keyed by account so switching accounts resets the plugin filters of the previous DAO. The dashboard brings its
    // own page header, which is why the workspace header never renders alongside it.
    if (activeAccount != null) {
        return (
            <WorkspaceDetailsPageDaoDashboard
                account={activeAccount}
                featuredDelegates={featuredDelegates}
                key={activeAccount.id}
            />
        );
    }

    return <WorkspaceDetailsPageOverview workspace={workspace} />;
};
