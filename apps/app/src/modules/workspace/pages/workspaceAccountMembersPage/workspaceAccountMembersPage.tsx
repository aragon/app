// Imported from the page file (not the module barrel): the RSC pulls in server-only prefetch code that must stay
// out of the barrel's client graph.

// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { DaoMembersPage } from '@/modules/governance/pages/daoMembersPage/daoMembersPage';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspaceAccountPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { WorkspaceAccountGate } from '../../components/workspaceAccountGate';

export interface IWorkspaceAccountMembersPageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspaceAccountPageParams>;
}

/**
 * Members of one account of a workspace.
 *
 * A workspace holds more than DAOs, and how an account answers "who are its members" depends on what it is: a DAO
 * has the members of its governance plugins, a Safe has its owners. Only the DAO branch exists so far, and it is
 * served by rendering the DAO members page as is — like `WorkspaceAccountOverviewPage` does with the dashboard: it
 * already prefetches the member list of the first body and owns its page container, and an account ID is a DAO ID,
 * so the only adaptation is the shape of the route parameters. Another account type is added by branching here.
 *
 * Only what the DAO page has no notion of is owned here: the workspaces feature flag, and an account that is not a
 * DAO, which `WorkspaceAccountGate` turns into an error state until that branch exists.
 */
export const WorkspaceAccountMembersPage: React.FC<
    IWorkspaceAccountMembersPageProps
> = async (props) => {
    const { params } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { accountId } = await params;
    const { network, address } = daoUtils.parseDaoId(accountId);

    return (
        <WorkspaceAccountGate accountId={accountId}>
            <DaoMembersPage
                params={Promise.resolve({ network, addressOrEns: address })}
            />
        </WorkspaceAccountGate>
    );
};
