// Imported from the page file (not the module barrel): the RSC pulls in server-only prefetch code that must stay
// out of the barrel's client graph.

// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { DaoMembersPage } from '@/modules/governance/pages/daoMembersPage/daoMembersPage';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspaceAccountPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { WorkspaceAccountType } from '../../api/workspaceService';
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
 * Switches on `workspaceAccountInfoUtils.resolveAccountType`: a Safe gets the workspace members page narrowed to it
 * (its owners), a DAO the DAO members page as is, with only the route parameters adapted. See "Safe support by
 * route" in `docs/projectDocs/createWorkspace.md`.
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

    const accountType =
        await workspaceAccountInfoUtils.resolveAccountType(accountId);

    switch (accountType) {
        case WorkspaceAccountType.SAFE:
            return (
                <Page.Container>
                    <WorkspaceMembersPageClient
                        pageSize={workspaceMembersCount}
                        workspaceId={workspaceId}
                    />
                </Page.Container>
            );
        case WorkspaceAccountType.DAO:
            return (
                <DaoMembersPage
                    params={Promise.resolve({ network, addressOrEns: address })}
                />
            );
        default:
            return accountType satisfies never;
    }
};
