import { IconType } from '@aragon/gov-ui-kit';
import type { IWorkspace } from '@/modules/workspace/api/workspaceService';
import type { INavigationLink } from '@/shared/components/navigation';

export type NavigationWorkspaceContext = 'page' | 'dialog';

class NavigationWorkspaceUtils {
    /**
     * Base URL of a workspace.
     * @param workspace - Workspace to build the URL for.
     * @param path - Optional path appended to the workspace base URL.
     * @returns The workspace URL.
     */
    getWorkspaceUrl = (workspace: IWorkspace, path?: string): string => {
        const baseUrl = `/workspace/${workspace.id}`;

        return path != null ? `${baseUrl}/${path}` : baseUrl;
    };

    /**
     * Navigation links of a workspace.
     *
     * @param workspace - Workspace to build the links for.
     * @param context - Whether the links are rendered in the navigation bar or in the navigation dialog.
     * @returns The navigation links.
     */
    buildLinks = (
        workspace: IWorkspace,
        context: NavigationWorkspaceContext,
    ): INavigationLink[] => [
        {
            label: 'app.application.navigationWorkspace.link.overview',
            link: this.getWorkspaceUrl(workspace, 'overview'),
            icon: IconType.APP_DASHBOARD,
            hidden: context === 'page',
            order: 100,
        },
        {
            label: 'app.application.navigationWorkspace.link.proposals',
            link: this.getWorkspaceUrl(workspace, 'proposals'),
            icon: IconType.APP_PROPOSALS,
            lgHidden: context === 'dialog',
            order: 200,
        },
        {
            label: 'app.application.navigationWorkspace.link.members',
            link: this.getWorkspaceUrl(workspace, 'members'),
            icon: IconType.APP_MEMBERS,
            lgHidden: context === 'dialog',
            order: 300,
        },
        {
            label: 'app.application.navigationWorkspace.link.assets',
            link: this.getWorkspaceUrl(workspace, 'assets'),
            icon: IconType.APP_ASSETS,
            lgHidden: context === 'dialog',
            order: 400,
        },
        {
            label: 'app.application.navigationWorkspace.link.transactions',
            link: this.getWorkspaceUrl(workspace, 'transactions'),
            icon: IconType.APP_TRANSACTIONS,
            lgHidden: context === 'dialog',
            order: 500,
        },
    ];
}

export const navigationWorkspaceUtils = new NavigationWorkspaceUtils();
