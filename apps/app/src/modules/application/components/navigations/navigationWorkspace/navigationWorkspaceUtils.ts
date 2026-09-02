import { IconType } from '@aragon/gov-ui-kit';
import type { IWorkspace } from '@/modules/workspace/api/workspaceService';
import type { INavigationLink } from '@/shared/components/navigation';

export type NavigationWorkspaceContext = 'page' | 'dialog';

class NavigationWorkspaceUtils {
    /**
     * Base URL of a workspace.
     * @param workspace - Workspace to build the URL for.
     * @returns The workspace base URL.
     */
    getWorkspaceUrl = (workspace: IWorkspace, path?: string): string => {
        const baseUrl = `/workspace/${workspace.id}`;

        return path != null ? `${baseUrl}/${path}` : baseUrl;
    };

    /**
     * Navigation links of a workspace. Only the pages that exist are listed, so no entry points to a route that has
     * not been implemented yet.
     * @param workspace - Workspace to build the links for.
     * @param context - Whether the links are rendered in the navigation bar or in the navigation dialog.
     * @returns The navigation links.
     */
    buildLinks = (
        workspace: IWorkspace,
        context: NavigationWorkspaceContext,
    ): INavigationLink[] => {
        const baseUrl = this.getWorkspaceUrl(workspace);
        const isDialogContext = context === 'dialog';

        return [
            {
                label: 'app.application.navigationWorkspace.link.assets',
                link: `${baseUrl}/assets`,
                icon: IconType.APP_ASSETS,
                lgHidden: isDialogContext,
                order: 400,
            },
            {
                label: 'app.application.navigationWorkspace.link.transactions',
                link: `${baseUrl}/transactions`,
                icon: IconType.APP_TRANSACTIONS,
                lgHidden: isDialogContext,
                order: 500,
            },
        ];
    };
}

export const navigationWorkspaceUtils = new NavigationWorkspaceUtils();
