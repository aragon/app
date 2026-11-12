import { redirect } from 'next/navigation-server';
import type { ReactNode } from 'react';
import { workspaceAccountInfoUtils } from '../../utils/workspaceAccountInfoUtils';
import {
    type WorkspaceAccountSection,
    workspaceUtils,
} from '../../utils/workspaceUtils';

export interface IWorkspaceSectionGuardProps {
    /**
     * ID of the workspace on the route.
     */
    workspaceId: string;
    /**
     * ID of the account on the route.
     */
    accountId: string;
    /**
     * Section the page below serves.
     */
    section: WorkspaceAccountSection;
    /**
     * Route under the section the page below serves, e.g. `execution` for `create/execution`, when the section
     * restricts it to fewer account types than the section itself.
     */
    subsection?: string;
    /**
     * Page rendered when the account type has the section.
     */
    children?: ReactNode;
}

/**
 * Redirects an account to its overview when its type does not have the section (a Safe on proposals or permissions),
 * or the route under it (a Safe on `create/execution`), as the account selector does. Reads `workspaceUtils.isSectionServed`, like the navigation and the selector.
 *
 * Wraps the page because a layout does not see its child segment. Existence is `LayoutWorkspaceAccount`'s check; the
 * lookup is the layout's cached one, so this sends no request.
 */
export const WorkspaceSectionGuard: React.FC<
    IWorkspaceSectionGuardProps
> = async (props) => {
    const { workspaceId, accountId, section, subsection, children } = props;

    const accountType =
        await workspaceAccountInfoUtils.resolveAccountType(accountId);

    if (
        !workspaceUtils.isSectionServed(section, {
            isAllAccounts: false,
            accountType,
            subsection,
        })
    ) {
        redirect(
            workspaceUtils.getAccountScopeUrl(
                workspaceId,
                accountId,
                'overview',
            ),
        );
    }

    return children;
};
