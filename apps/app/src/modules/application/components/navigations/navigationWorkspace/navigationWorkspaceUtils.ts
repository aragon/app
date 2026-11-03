import { IconType } from '@aragon/gov-ui-kit';
import { workspaceUtils } from '@/modules/workspace/utils/workspaceUtils';
import type { INavigationLink } from '@/shared/components/navigation';

export type NavigationWorkspaceContext = 'page' | 'dialog';

class NavigationWorkspaceUtils {
    /**
     * Navigation links of a workspace.
     *
     * Every link is scoped to an account, the aggregated segment standing in for "every account of the workspace".
     *
     * Takes the workspace ID and not the workspace, because the ID is all a link needs and it is on the route: the
     * navigation can therefore build every link before the workspace has been read, which is what lets it paint
     * outside `WorkspaceGate` instead of behind its spinner on a cold load.
     * @param workspaceId - ID of the workspace to build the links for.
     * @param context - Whether the links are rendered in the navigation bar or in the navigation dialog.
     * @param accountId - Account the links stay scoped to, defaulting to every account of the workspace. Carrying
     * it keeps a tab change on the account being looked at. A segment naming no account scope falls back to the
     * aggregated one, so links stay servable on a URL the app does not serve — e.g. the workspace not-found page,
     * which renders inside this navigation.
     * @returns The navigation links.
     */
    buildLinks = (
        workspaceId: string,
        context: NavigationWorkspaceContext,
        accountId?: string,
    ): INavigationLink[] => {
        const scope = workspaceUtils.resolveAccountScope(accountId);

        return [
            {
                label: 'app.application.navigationWorkspace.link.overview',
                link: workspaceUtils.getAccountScopeUrl(
                    workspaceId,
                    scope,
                    'overview',
                ),
                icon: IconType.APP_DASHBOARD,
                hidden: context === 'page',
                order: 100,
            },
            {
                label: 'app.application.navigationWorkspace.link.proposals',
                link: workspaceUtils.getAccountScopeUrl(
                    workspaceId,
                    scope,
                    'proposals',
                ),
                icon: IconType.APP_PROPOSALS,
                order: 200,
            },
            {
                label: 'app.application.navigationWorkspace.link.members',
                link: workspaceUtils.getAccountScopeUrl(
                    workspaceId,
                    scope,
                    'members',
                ),
                icon: IconType.APP_MEMBERS,
                order: 300,
            },
            {
                label: 'app.application.navigationWorkspace.link.assets',
                link: workspaceUtils.getAccountScopeUrl(
                    workspaceId,
                    scope,
                    'assets',
                ),
                icon: IconType.APP_ASSETS,
                order: 400,
            },
            {
                label: 'app.application.navigationWorkspace.link.transactions',
                link: workspaceUtils.getAccountScopeUrl(
                    workspaceId,
                    scope,
                    'transactions',
                ),
                icon: IconType.APP_TRANSACTIONS,
                order: 500,
            },
        ];
    };
}

export const navigationWorkspaceUtils = new NavigationWorkspaceUtils();
