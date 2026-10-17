// Imported from the page file (not the module barrel): the RSC pulls in server-only prefetch code that must stay
// out of the barrel's client graph.

// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { DaoDashboardPage } from '@/modules/dashboard/pages/daoDashboardPage/daoDashboardPage';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspaceAccountPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { WorkspaceAccountGate } from '../../components/workspaceAccountGate';

export interface IWorkspaceAccountOverviewPageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspaceAccountPageParams>;
}

/**
 * Overview of one account of a workspace, which is the dashboard of its DAO.
 *
 * The DAO dashboard page is rendered as is rather than reimplemented: it already owns the CMS read its client needs
 * and its own page container, and a workspace DAO account ID is a DAO ID, so the only adaptation is the shape of
 * the route parameters. `resolveDaoId` rebuilds the very ID this page was given — it reaches the network only for an
 * ENS name, which an account ID never is.
 *
 * Only what the dashboard has no notion of is owned here: the workspaces feature flag, and an account whose DAO
 * cannot be read, which `WorkspaceAccountGate` turns into an error state.
 */
export const WorkspaceAccountOverviewPage: React.FC<
    IWorkspaceAccountOverviewPageProps
> = async (props) => {
    const { params } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { accountId } = await params;
    const { network, address } = daoUtils.parseDaoId(accountId);

    return (
        <WorkspaceAccountGate accountId={accountId}>
            <DaoDashboardPage
                params={Promise.resolve({ network, addressOrEns: address })}
            />
        </WorkspaceAccountGate>
    );
};
