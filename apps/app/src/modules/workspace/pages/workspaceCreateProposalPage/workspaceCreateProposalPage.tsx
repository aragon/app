// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { CreateProposalPage } from '@/modules/governance/pages/createProposalPage';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspaceCreateProposalPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { WorkspaceGate } from '../../components/workspaceGate';

export interface IWorkspaceCreateProposalPageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspaceCreateProposalPageParams>;
}

/**
 * Page of `/workspace/{workspaceId}/{accountId}/create/{pluginAddress}/proposal`: the DAO's create-proposal page. The
 * layout guards the account; the page renders `WorkspaceGate`, as it sits outside `LayoutWorkspace`.
 */
export const WorkspaceCreateProposalPage: React.FC<
    IWorkspaceCreateProposalPageProps
> = async (props) => {
    const { params } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { workspaceId, accountId, pluginAddress } = await params;
    const { network, address } = daoUtils.parseDaoId(accountId);

    return (
        <WorkspaceGate workspaceId={workspaceId}>
            <CreateProposalPage
                params={Promise.resolve({
                    network,
                    addressOrEns: address,
                    pluginAddress,
                })}
            />
        </WorkspaceGate>
    );
};
