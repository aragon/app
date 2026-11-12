import { notFound } from 'next/navigation-server';
import type { ReactNode } from 'react';
import { LayoutWizardCreateProposal } from '@/modules/governance/components/layoutWizardCreateProposal';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspaceCreateProposalPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { workspaceAccountInfoUtils } from '../../utils/workspaceAccountInfoUtils';
import { workspaceUtils } from '../../utils/workspaceUtils';
import { WorkspaceSectionGuard } from '../workspaceSectionGuard';

export interface ILayoutWizardCreateWorkspaceProposalProps {
    /**
     * URL parameters of the layout.
     */
    params: Promise<IWorkspaceCreateProposalPageParams>;
    /**
     * Children of the layout.
     */
    children?: ReactNode;
}

/**
 * Layout of `/workspace/{workspaceId}/{accountId}/create/{pluginAddress}/proposal`: the DAO's create-proposal layout,
 * exiting to the account's workspace proposals.
 *
 * The guard wraps the DAO layout, not the page: the DAO layout replaces the page with its error state when the DAO read
 * fails (a Safe, an unknown address), so a guard on the page would never run.
 */
export const LayoutWizardCreateWorkspaceProposal: React.FC<
    ILayoutWizardCreateWorkspaceProposalProps
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
        'proposals',
    );

    return (
        <WorkspaceSectionGuard
            accountId={accountId}
            section="create"
            subsection="proposal"
            workspaceId={workspaceId}
        >
            <LayoutWizardCreateProposal
                exitPath={exitPath}
                params={Promise.resolve({
                    network,
                    addressOrEns: address,
                    pluginAddress,
                })}
            >
                {children}
            </LayoutWizardCreateProposal>
        </WorkspaceSectionGuard>
    );
};
