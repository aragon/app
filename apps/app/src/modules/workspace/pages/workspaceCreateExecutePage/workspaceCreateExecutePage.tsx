// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { CreateExecuteActionsPage } from '@/modules/governance/pages/createExecuteActionsPage';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspaceAccountPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { WorkspaceGate } from '../../components/workspaceGate';
import { workspaceUtils } from '../../utils/workspaceUtils';

export interface IWorkspaceCreateExecutePageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspaceAccountPageParams>;
}

/**
 * Page of `/workspace/{workspaceId}/{accountId}/create/execute`: the DAO's direct-execute page, redirecting to the
 * account's workspace transactions when the wallet cannot execute. The layout guards the account; the page renders
 * `WorkspaceGate`, as it sits outside `LayoutWorkspace`.
 */
export const WorkspaceCreateExecutePage: React.FC<
    IWorkspaceCreateExecutePageProps
> = async (props) => {
    const { params } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { workspaceId, accountId } = await params;
    const { network, address } = daoUtils.parseDaoId(accountId);
    const exitPath = workspaceUtils.getAccountScopeUrl(
        workspaceId,
        accountId,
        'transactions',
    );

    return (
        <WorkspaceGate workspaceId={workspaceId}>
            <CreateExecuteActionsPage
                exitPath={exitPath}
                params={Promise.resolve({ network, addressOrEns: address })}
            />
        </WorkspaceGate>
    );
};
