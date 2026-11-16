import { notFound } from 'next/navigation-server';
import type { ReactNode } from 'react';
import { LayoutWizardCreateExecuteActions } from '@/modules/governance/components/layoutWizardCreateExecuteActions';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspaceAccountPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { workspaceAccountInfoUtils } from '../../utils/workspaceAccountInfoUtils';
import { workspaceUtils } from '../../utils/workspaceUtils';
import { WorkspaceSectionGuard } from '../workspaceSectionGuard';

export interface ILayoutWizardCreateWorkspaceExecuteProps {
    /**
     * URL parameters of the layout.
     */
    params: Promise<IWorkspaceAccountPageParams>;
    /**
     * Children of the layout.
     */
    children?: ReactNode;
}

/**
 * Layout of `/workspace/{workspaceId}/{accountId}/create/execute`: the DAO's `/dao/…/create/execute` layout,
 * exiting to the account's workspace transactions.
 *
 * The guard wraps the DAO layout, not the page: the DAO layout replaces the page with its error state when the DAO read
 * fails (a Safe, an unknown address), so a guard on the page would never run.
 */
export const LayoutWizardCreateWorkspaceExecute: React.FC<
    ILayoutWizardCreateWorkspaceExecuteProps
> = async (props) => {
    const { params, children } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { workspaceId, accountId } = await params;

    if (!workspaceAccountInfoUtils.isValidAccountId(accountId)) {
        notFound();
    }

    const { network, address } = daoUtils.parseDaoId(accountId);
    const exitPath = workspaceUtils.getAccountScopeUrl(
        workspaceId,
        accountId,
        'transactions',
    );

    return (
        <WorkspaceSectionGuard
            accountId={accountId}
            section="create"
            subsection="execute"
            workspaceId={workspaceId}
        >
            <LayoutWizardCreateExecuteActions
                exitPath={exitPath}
                params={Promise.resolve({ network, addressOrEns: address })}
            >
                {children}
            </LayoutWizardCreateExecuteActions>
        </WorkspaceSectionGuard>
    );
};
