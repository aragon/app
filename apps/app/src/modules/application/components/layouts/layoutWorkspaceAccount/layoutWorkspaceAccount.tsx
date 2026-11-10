import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query';
import { notFound } from 'next/navigation-server';
import type { ReactNode } from 'react';
import { WorkspaceAccountType } from '@/modules/workspace/api/workspaceService';
import { WorkspaceExternalAccountBanner } from '@/modules/workspace/components/workspaceExternalAccountBanner';
import { workspaceAccountInfoUtils } from '@/modules/workspace/utils/workspaceAccountInfoUtils';
import { daoOptions } from '@/shared/api/daoService';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspaceAccountPageParams } from '@/shared/types';
import { ErrorBoundary } from '../../errorBoundary';

export interface ILayoutWorkspaceAccountProps {
    /**
     * Children of the layout.
     */
    children?: ReactNode;
    /**
     * URL parameters of the layout.
     */
    params: Promise<IWorkspaceAccountPageParams>;
}

/**
 * Layout of the pages of a workspace scoped to one account, `/workspace/{workspaceId}/{accountId}/…`.
 *
 * Owns whether the account exists: `workspaceAccountInfoUtils.resolveAccountType` 404s an address that is neither an
 * indexed DAO nor a Safe and throws when the lookup cannot tell, which the `LayoutWorkspace` error boundary catches.
 * Throwing works from a layout because a throwing layout is discarded with its page; a layout cannot *replace* its
 * page. Which sections an account type has is `WorkspaceSectionGuard`'s job, as a layout does not see its child
 * segment. See "Account existence and the account lookup" in `docs/projectDocs/createWorkspace.md`.
 *
 * The account ID is also a DAO ID, so the DAO is read here without the workspace registry (local storage, unreadable
 * on the server) and hydrated for the sections. A failed read fails the route for a DAO only, as a Safe has none.
 * The account lookup is not hydrated: the navigation creates that query before this layout's `HydrationBoundary`.
 *
 * `WorkspaceExternalAccountBanner` sits above every section, the way `BannerDao` does in `LayoutDao`: it renders only
 * when the route names an account the workspace does not hold, and offers to add it.
 *
 * The `workspaces` flag is checked again here, although `LayoutWorkspace` above already checks it: nested layouts
 * render in parallel, so the parent's 404 does not stop this layout from requesting the DAO.
 */
export const LayoutWorkspaceAccount: React.FC<
    ILayoutWorkspaceAccountProps
> = async (props) => {
    const { params, children } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { accountId } = await params;

    // Bots probe account-addressed URLs; the account ID is used verbatim as the DAO ID, so it is validated before
    // any request.
    if (!workspaceAccountInfoUtils.isValidAccountId(accountId)) {
        notFound();
    }

    const queryClient = new QueryClient();

    const [isDaoRead, accountType] = await Promise.all([
        queryClient
            .fetchQuery(daoOptions({ urlParams: { id: accountId } }))
            .then(
                () => true,
                () => false,
            ),
        workspaceAccountInfoUtils.resolveAccountType(accountId),
    ]);

    // A Safe has no DAO to read, but the DAO pages render nothing without theirs.
    if (accountType === WorkspaceAccountType.DAO && !isDaoRead) {
        throw new Error(
            'LayoutWorkspaceAccount: the DAO of the account could not be read.',
        );
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <WorkspaceExternalAccountBanner />
            <ErrorBoundary>{children}</ErrorBoundary>
        </HydrationBoundary>
    );
};
