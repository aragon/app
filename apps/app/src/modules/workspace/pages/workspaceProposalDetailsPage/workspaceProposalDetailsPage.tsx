// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
// Imported from the page file (not the module barrel): the RSC pulls in server-only prefetch code that must stay
// out of the barrel's client graph.
import { DaoProposalDetailsPage } from '@/modules/governance/pages/daoProposalDetailsPage/daoProposalDetailsPage';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspaceAccountProposalPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { WorkspaceAccountGate } from '../../components/workspaceAccountGate';

export interface IWorkspaceProposalDetailsPageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspaceAccountProposalPageParams>;
}

/**
 * Details of one proposal of one account of a workspace.
 *
 * Like `WorkspaceAccountMembersPage`, only the DAO branch exists so far: the DAO proposal details page is rendered
 * as is and only the shape of the route parameters is adapted. Another account type is added by branching here
 * or adapted into the underlying `DaoProposalDetailsPage` if it can be made to handle both account types.
 *
 * Deliberately deferred: the page's breadcrumb and its error `actionLink` resolve to `/dao/…`, as do the voter,
 * publisher and settings links of its nested plugin components, so a reader who uses one leaves the workspace. The
 * rewiring is held back until the rest of the workspace migration lands and every call site is visible.
 */
export const WorkspaceProposalDetailsPage: React.FC<
    IWorkspaceProposalDetailsPageProps
> = async (props) => {
    const { params } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { accountId, proposalSlug } = await params;
    const { network, address } = daoUtils.parseDaoId(accountId);

    return (
        <WorkspaceAccountGate accountId={accountId}>
            <DaoProposalDetailsPage
                params={Promise.resolve({
                    network,
                    addressOrEns: address,
                    proposalSlug,
                })}
            />
        </WorkspaceAccountGate>
    );
};
