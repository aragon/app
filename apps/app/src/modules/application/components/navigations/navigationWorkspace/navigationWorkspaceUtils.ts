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
     * Navigation links of a workspace. Only the pages that exist are listed, so no entry points to a route that has
     * not been implemented yet: the aggregated members, assets and transactions pages join the overview here once
     * they land, at orders 300, 400 and 500.
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
            link: this.getWorkspaceUrl(workspace),
            icon: IconType.APP_DASHBOARD,
            lgHidden: context === 'dialog',
            order: 200,
        },
    ];
}

export const navigationWorkspaceUtils = new NavigationWorkspaceUtils();
