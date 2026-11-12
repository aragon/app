import { notFound } from 'next/navigation-server';
import type { ReactNode } from 'react';
import { LayoutWizardCreateProcess } from '@/modules/createDao/components/layoutWizardCreateProcess';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspaceCreateProcessPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { workspaceAccountInfoUtils } from '../../utils/workspaceAccountInfoUtils';
import { workspaceUtils } from '../../utils/workspaceUtils';
import { WorkspaceSectionGuard } from '../workspaceSectionGuard';

export interface ILayoutWizardCreateWorkspaceProcessProps {
    /**
     * URL parameters of the layout.
     */
    params: Promise<IWorkspaceCreateProcessPageParams>;
    /**
     * Children of the layout.
     */
    children?: ReactNode;
}

/**
 * Layout of `/workspace/{workspaceId}/{accountId}/create/{pluginAddress}/process`: the DAO's create-process layout,
 * exiting to the account's workspace settings.
 *
 * The guard wraps the DAO layout, not the page: `LayoutWizard` replaces the page (404 or error state) when the DAO read
 * fails (a Safe, an unknown address), so a guard on the page would never run.
 */
export const LayoutWizardCreateWorkspaceProcess: React.FC<
    ILayoutWizardCreateWorkspaceProcessProps
> = async (props) => {
    const { params, children } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { workspaceId, accountId, pluginAddress } = await params;

    if (!workspaceAccountInfoUtils.isValidAccountId(accountId)) {
        notFound();
    }

    const { network, address } = daoUtils.parseDaoId(accountId);
    const exitPath = workspaceUtils.getAccountScopeUrl(
        workspaceId,
        accountId,
        'settings',
    );

    return (
        <WorkspaceSectionGuard
            accountId={accountId}
            section="create"
            subsection="process"
            workspaceId={workspaceId}
        >
            <LayoutWizardCreateProcess
                exitPath={exitPath}
                params={Promise.resolve({
                    network,
                    addressOrEns: address,
                    pluginAddress,
                })}
            >
                {children}
            </LayoutWizardCreateProcess>
        </WorkspaceSectionGuard>
    );
};
