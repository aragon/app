import { redirect } from 'next/navigation-server';
import type { ReactNode } from 'react';
import { workspaceAccountInfoUtils } from '../../utils/workspaceAccountInfoUtils';
import {
    type WorkspaceAccountSection,
    type WorkspaceAccountSubsection,
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
     * Section of the route.
     */
    section: WorkspaceAccountSection;
    /**
     * Route under the section, e.g. `execute` for `create/execute`.
     */
    subsection?: WorkspaceAccountSubsection;
    /**
     * Rendered when the account type has the section (and the subsection).
     */
    children?: ReactNode;
}

/**
 * Redirects an account to its overview when its type does not have the section (a Safe on proposals or permissions) or
 * the subsection (a Safe on `create/execute`). Reads `workspaceUtils.isSectionServed`, like the navigation and the
 * account selector.
 *
 * Under `LayoutWorkspaceAccount` it wraps the page, as a layout does not see its child segment, and reuses the layout's
 * cached lookup. A create wizard has no `LayoutWorkspaceAccount`, so its layout renders the guard, and the guard's
 * lookup is the existence check: a 404 for an unknown account, a throw when the lookup cannot tell.
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
