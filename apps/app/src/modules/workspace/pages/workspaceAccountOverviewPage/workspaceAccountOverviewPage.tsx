// Imported from the page file (not the module barrel): the RSC pulls in server-only prefetch code that must stay
// out of the barrel's client graph.

// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { DaoDashboardPage } from '@/modules/dashboard/pages/daoDashboardPage/daoDashboardPage';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspaceAccountPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { WorkspaceAccountType } from '../../api/workspaceService';
import { workspaceAccountInfoUtils } from '../../utils/workspaceAccountInfoUtils';
import { WorkspaceSafeDashboardPageClient } from './workspaceSafeDashboardPageClient';

export interface IWorkspaceAccountOverviewPageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspaceAccountPageParams>;
}

/**
 * Overview of one account of a workspace, a DAO or a Safe: the dashboard of the account.
 *
 * Switches on `workspaceAccountInfoUtils.resolveAccountType`.
 *
 * The DAO branch renders the DAO dashboard page as is rather than reimplementing it: it already owns the CMS read its
 * client needs and its own page container, and a workspace DAO account ID is a DAO ID, so the only adaptation is the
 * shape of the route parameters. `resolveDaoId` rebuilds the very ID this page was given — it reaches the network
 * only for an ENS name, which an account ID never is.
 *
 * See "Safe support by route" in `docs/projectDocs/createWorkspace.md`.
 */
export const WorkspaceAccountOverviewPage: React.FC<
    IWorkspaceAccountOverviewPageProps
> = async (props) => {
    const { params } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { workspaceId, accountId } = await params;
    const { network, address } = daoUtils.parseDaoId(accountId);

    const accountType =
        await workspaceAccountInfoUtils.resolveAccountType(accountId);

    switch (accountType) {
        case WorkspaceAccountType.SAFE:
            return (
                <Page.Container>
                    <WorkspaceSafeDashboardPageClient
                        address={address}
                        network={network}
                        workspaceId={workspaceId}
                    />
                </Page.Container>
            );
        case WorkspaceAccountType.DAO:
            return (
                <DaoDashboardPage
                    params={Promise.resolve({ network, addressOrEns: address })}
                />
            );
        default:
            return accountType satisfies never;
    }
};
