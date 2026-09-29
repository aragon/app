'use client';

import { Card, EmptyState, Spinner } from '@aragon/gov-ui-kit';
import { DaoDashboardPageClient } from '@/modules/dashboard/pages/daoDashboardPage';
import type { IFeaturedDelegates } from '@/shared/api/cmsService';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceAccount } from '../../api/workspaceService';

export interface IWorkspaceDetailsPageDaoDashboardProps {
    /**
     * DAO account of the workspace to display the dashboard of. Safe accounts have no dashboard and are left
     * out of the account selector options, so they never reach this component.
     */
    account: IWorkspaceAccount;
    /**
     * Featured delegates config from CMS, forwarded to the DAO dashboard.
     */
    featuredDelegates: IFeaturedDelegates[];
}

/**
 * Dashboard of one DAO account of a workspace, rendered by the DAO dashboard page itself.
 *
 * The dashboard brings its own page header, content and aside, so it stands in for the whole workspace overview
 * rather than being nested into it.
 */
export const WorkspaceDetailsPageDaoDashboard: React.FC<
    IWorkspaceDetailsPageDaoDashboardProps
> = (props) => {
    const { account, featuredDelegates } = props;

    const { t } = useTranslations();

    // The DAO dashboard renders nothing until its DAO resolves, which the DAO route hides by prefetching it on the
    // server. Nothing hydrates it under the workspace layout, so it is read here under the same query key to drive
    // the states below; the read the dashboard makes once mounted then hits this cache entry.
    const { isPending, isError } = useDao({ urlParams: { id: account.id } });

    // The dashboard must not be mounted for a DAO that failed to load: its own read of the DAO would refetch the
    // failed query on mount, which reads as pending again and would swap it back for the skeleton in a loop.
    if (isError) {
        return (
            <Page.Content>
                <Page.Main>
                    <Card className="border border-neutral-100 py-10">
                        <EmptyState
                            description={t(
                                'app.workspace.workspaceDetailsPage.daoError.description',
                            )}
                            heading={t(
                                'app.workspace.workspaceDetailsPage.daoError.heading',
                            )}
                            objectIllustration={{ object: 'WARNING' }}
                        />
                    </Card>
                </Page.Main>
            </Page.Content>
        );
    }

    // This would not be necessary when the page is server-rendered.
    if (isPending) {
        return (
            <Page.Content>
                <Page.Main>
                    <div className="flex justify-center py-20">
                        <Spinner size="lg" variant="neutral" />
                    </div>
                </Page.Main>
                {/* Reserves the aside column of the dashboard, so the layout does not jump once it mounts. */}
                <Page.Aside />
            </Page.Content>
        );
    }

    // A workspace DAO account ID is its DAO ID, so the account is handed to the dashboard as is.
    return (
        <DaoDashboardPageClient
            daoId={account.id}
            featuredDelegates={featuredDelegates}
        />
    );
};
