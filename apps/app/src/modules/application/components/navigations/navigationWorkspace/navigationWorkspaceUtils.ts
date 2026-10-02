import { IconType } from '@aragon/gov-ui-kit';
import type { IWorkspace } from '@/modules/workspace/api/workspaceService';
import {
    workspaceAllAccountsSegment,
    workspaceUtils,
} from '@/modules/workspace/utils/workspaceUtils';
import type { INavigationLink } from '@/shared/components/navigation';

export type NavigationWorkspaceContext = 'page' | 'dialog';

class NavigationWorkspaceUtils {
    /**
     * Base URL of a workspace. Kept taking the workspace itself, as that is what the navigation holds; the shape
     * of the URL is owned by `workspaceUtils`.
     * @param workspace - Workspace to build the URL for.
     * @param path - Optional path appended to the workspace base URL.
     * @returns The workspace URL.
     */
    getWorkspaceUrl = (workspace: IWorkspace, path?: string): string =>
        workspaceUtils.getWorkspaceUrl(workspace.id, path);

    /**
     * Navigation links of a workspace.
     *
     * Every link is scoped to an account, the aggregated segment standing in for "every account of the workspace".
     * @param workspace - Workspace to build the links for.
     * @param context - Whether the links are rendered in the navigation bar or in the navigation dialog.
     * @param accountId - Account the links stay scoped to, defaulting to every account of the workspace. Carrying
     * it keeps a tab change on the account being looked at.
     * @returns The navigation links.
     */
    buildLinks = (
        workspace: IWorkspace,
        context: NavigationWorkspaceContext,
        accountId: string = workspaceAllAccountsSegment,
    ): INavigationLink[] => [
        {
            label: 'app.application.navigationWorkspace.link.overview',
            link: workspaceUtils.getAccountScopeUrl(
                workspace.id,
                accountId,
                'overview',
            ),
            icon: IconType.APP_DASHBOARD,
            hidden: context === 'page',
            order: 100,
        },
        {
            label: 'app.application.navigationWorkspace.link.proposals',
            link: workspaceUtils.getAccountScopeUrl(
                workspace.id,
                accountId,
                'proposals',
            ),
            icon: IconType.APP_PROPOSALS,
            order: 200,
        },
        {
            label: 'app.application.navigationWorkspace.link.members',
            link: workspaceUtils.getAccountScopeUrl(
                workspace.id,
                accountId,
                'members',
            ),
            icon: IconType.APP_MEMBERS,
            order: 300,
        },
        {
            label: 'app.application.navigationWorkspace.link.assets',
            link: workspaceUtils.getAccountScopeUrl(
                workspace.id,
                accountId,
                'assets',
            ),
            icon: IconType.APP_ASSETS,
            order: 400,
        },
        {
            label: 'app.application.navigationWorkspace.link.transactions',
            link: workspaceUtils.getAccountScopeUrl(
                workspace.id,
                accountId,
                'transactions',
            ),
            icon: IconType.APP_TRANSACTIONS,
            order: 500,
        },
    ];
}

export const navigationWorkspaceUtils = new NavigationWorkspaceUtils();
