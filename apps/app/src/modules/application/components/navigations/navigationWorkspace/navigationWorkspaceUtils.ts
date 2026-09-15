import { IconType } from '@aragon/gov-ui-kit';
import type { IWorkspaceAccountInfo } from '@/modules/workspace/api/workspaceQueryService';
import {
    type IWorkspace,
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '@/modules/workspace/api/workspaceService';
import { workspaceUtils } from '@/modules/workspace/utils/workspaceUtils';
import type { INavigationLink } from '@/shared/components/navigation';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';

export type NavigationWorkspaceContext = 'page' | 'dialog';

/**
 * A link to an account of the workspace, displayed on the navigation dialog.
 */
export interface IWorkspaceAccountLink {
    /**
     * ID of the account the link points at.
     */
    id: string;
    /**
     * Label of the link, i.e. the name of the account or its truncated address.
     */
    label: string;
    /**
     * URL of the account.
     */
    url: string;
}

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
            link: this.getWorkspaceUrl(workspace),
            icon: IconType.APP_DASHBOARD,
            lgHidden: context === 'dialog',
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

    /**
     * Link pointing at an account outside of the workspace: its own page on the app for a DAO, its address on the
     * block explorer for anything else, since only DAOs have a page here.
     * @param account - Account to build the link for.
     * @returns The URL of the account, or undefined when the network publishes no block explorer.
     */
    getAccountUrl = (account: IWorkspaceAccount): string | undefined => {
        const { type, network, address } = account;

        if (type === WorkspaceAccountType.DAO) {
            return `/dao/${network}/${address}`;
        }

        const explorerUrl =
            networkDefinitions[network].blockExplorers?.default.url;

        return explorerUrl != null
            ? `${explorerUrl}/address/${address}`
            : undefined;
    };

    /**
     * Links to the accounts of a workspace, listed on the navigation dialog.
     *
     * They are deliberately kept out of the navigation bar and out of the `INavigationLink` list: the bar lists the
     * pages of the workspace, while these lead out of it, and their labels are account names rather than
     * translation keys — `NavigationLinks` runs its labels through `t`, which would replace a name that happens to
     * match a key.
     * @param workspace - Workspace to build the links for.
     * @param accountInfos - Accounts as resolved by the accounts API, used to label them with the indexed DAO name.
     * @returns One link per account that has a destination.
     */
    buildAccountLinks = (
        workspace: IWorkspace,
        accountInfos?: IWorkspaceAccountInfo[],
    ): IWorkspaceAccountLink[] =>
        workspace.accounts.reduce<IWorkspaceAccountLink[]>((links, account) => {
            const url = this.getAccountUrl(account);

            if (url == null) {
                return links;
            }

            const accountInfo = workspaceUtils.findAccountInfo(
                accountInfos,
                account,
            );

            return [
                ...links,
                {
                    id: account.id,
                    label: workspaceUtils.getAccountLabel(account, accountInfo),
                    url,
                },
            ];
        }, []);
}

export const navigationWorkspaceUtils = new NavigationWorkspaceUtils();
