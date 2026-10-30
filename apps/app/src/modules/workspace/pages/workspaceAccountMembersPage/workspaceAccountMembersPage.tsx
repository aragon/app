// Imported from the page file (not the module barrel): the RSC pulls in server-only prefetch code that must stay
// out of the barrel's client graph.

// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { DaoMembersPage } from '@/modules/governance/pages/daoMembersPage/daoMembersPage';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspaceAccountPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { WorkspaceAccountInfoType } from '../../api/workspaceQueryService';
import { WorkspaceAccountGate } from '../../components/workspaceAccountGate';
import { workspaceAccountInfoUtils } from '../../utils/workspaceAccountInfoUtils';
import {
    WorkspaceMembersPageClient,
    workspaceMembersCount,
} from '../workspaceMembersPage';

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
 * has the members of its governance plugins, a Safe has its owners.
 *
 * The Safe branch comes first, before `WorkspaceAccountGate`, because the gate fails the route for anything whose DAO
 * record cannot be read, a Safe included. A Safe renders the workspace members page narrowed to the account, which
 * lists its owners. The account type comes from the workspace accounts API; a failed lookup falls back to the DAO
 * branch.
 *
 * The DAO branch is unchanged and sits behind the gate: it renders the DAO members page as is — like
 * `WorkspaceAccountOverviewPage` does with the dashboard: it already prefetches the member list of the first body and
 * owns its page container, and an account ID is a DAO ID, so the only adaptation is the shape of the route parameters.
 *
 * See "Safe support by route" in `docs/projectDocs/createWorkspace.md`.
 */
export const WorkspaceAccountMembersPage: React.FC<
    IWorkspaceAccountMembersPageProps
> = async (props) => {
    const { params } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { workspaceId, accountId } = await params;
    const { network, address } = daoUtils.parseDaoId(accountId);

    const accountInfo = await workspaceAccountInfoUtils.getAccountInfo({
        network,
        address,
    });

    // TODO: investigate how the gate should behave for a Safe
    // given that not all DAO routes have corresponding Safe routes. For now, the gate is skipped for a Safe, and the members page is rendered directly.
    if (accountInfo?.type === WorkspaceAccountInfoType.SAFE) {
        return (
            <Page.Container>
                <WorkspaceMembersPageClient
                    pageSize={workspaceMembersCount}
                    workspaceId={workspaceId}
                />
            </Page.Container>
        );
    }

    return (
        <WorkspaceAccountGate accountId={accountId}>
            <DaoMembersPage
                params={Promise.resolve({ network, addressOrEns: address })}
            />
        </WorkspaceAccountGate>
    );
};
