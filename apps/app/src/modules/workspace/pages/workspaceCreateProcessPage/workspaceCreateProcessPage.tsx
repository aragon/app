// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { CreateProcessPage } from '@/modules/createDao/pages/createProcessPage';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspaceCreateProcessPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { WorkspaceGate } from '../../components/workspaceGate';

export interface IWorkspaceCreateProcessPageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspaceCreateProcessPageParams>;
}

/**
 * Page of `/workspace/{workspaceId}/{accountId}/create/{pluginAddress}/process`: the DAO's create-process page. The
 * layout guards the account; the page renders `WorkspaceGate`, as it sits outside `LayoutWorkspace`.
 */
export const WorkspaceCreateProcessPage: React.FC<
    IWorkspaceCreateProcessPageProps
> = async (props) => {
    const { params } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { workspaceId, accountId, pluginAddress } = await params;
    const { network, address } = daoUtils.parseDaoId(accountId);

    return (
        <WorkspaceGate workspaceId={workspaceId}>
            <CreateProcessPage
                params={Promise.resolve({
                    network,
                    addressOrEns: address,
                    pluginAddress,
                })}
            />
        </WorkspaceGate>
    );
};
