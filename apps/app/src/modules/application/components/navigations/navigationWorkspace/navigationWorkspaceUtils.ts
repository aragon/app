import { IconType } from '@aragon/gov-ui-kit';
import {
    workspaceDaoAccountSections,
    workspaceUtils,
} from '@/modules/workspace/utils/workspaceUtils';
import type { INavigationLink } from '@/shared/components/navigation';

class NavigationWorkspaceUtils {
    /**
     * Navigation links of the account a workspace page is scoped to.
     *
     * Every link is scoped to an account, the aggregated segment standing in for "every account of the workspace".
     *
     * Takes the workspace ID and not the workspace, because the ID is all a link needs and it is on the route: the
     * navigation can therefore build every link before the workspace has been read, which is what lets it paint
     * outside `WorkspaceGate` instead of behind its spinner on a cold load.
     *
     * The same links fill the sidebar and the navigation dialog, as only one of the two is shown at a time. The
     * links of the workspace itself are built apart (`buildWorkspaceLinks`), below a divider.
     * @param workspaceId - ID of the workspace to build the links for.
     * @param accountId - Account the links stay scoped to, defaulting to every account of the workspace. Carrying
     * it keeps a tab change on the account being looked at. A segment naming no account scope falls back to the
     * aggregated one, so links stay servable on a URL the app does not serve — e.g. the workspace not-found page,
     * which renders inside this navigation.
     * @param isDaoAccount - Whether the account is a DAO, which alone has permissions and settings: the aggregated
     * scope and a Safe hide those links.
     * @returns The navigation links.
     */
    buildLinks = (
        workspaceId: string,
        accountId?: string,
        isDaoAccount = false,
    ): INavigationLink[] => {
        const scope = workspaceUtils.resolveAccountScope(accountId);
        const [permissions, settings] = workspaceDaoAccountSections;

        return [
            {
                label: 'app.application.navigationWorkspace.link.overview',
                link: workspaceUtils.getAccountScopeUrl(
                    workspaceId,
                    scope,
                    'overview',
                ),
                icon: IconType.APP_DASHBOARD,
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
            {
                label: 'app.application.navigationWorkspace.link.permissions',
                link: workspaceUtils.getAccountScopeUrl(
                    workspaceId,
                    scope,
                    permissions,
                ),
                icon: IconType.APP_PERMISSIONS,
                order: 600,
                hidden: !isDaoAccount,
            },
            {
                label: 'app.application.navigationWorkspace.link.accountSettings',
                link: workspaceUtils.getAccountScopeUrl(
                    workspaceId,
                    scope,
                    settings,
                ),
                icon: IconType.SETTINGS,
                order: 700,
                hidden: !isDaoAccount,
            },
        ];
    };

    /**
     * Navigation links of the workspace itself, rather than of one of its accounts.
     * @param workspaceId - ID of the workspace to build the links for.
     * @returns The navigation links.
     */
    buildWorkspaceLinks = (workspaceId: string): INavigationLink[] => [
        {
            label: 'app.application.navigationWorkspace.link.edit',
            link: workspaceUtils.getWorkspaceEditUrl(workspaceId),
            icon: IconType.PEN,
            order: 100,
        },
    ];
}

export const navigationWorkspaceUtils = new NavigationWorkspaceUtils();
