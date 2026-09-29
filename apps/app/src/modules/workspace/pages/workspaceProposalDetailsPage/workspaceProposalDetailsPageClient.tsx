'use client';

import { DaoProposalDetailsPageClient } from '@/modules/governance/pages/daoProposalDetailsPage';
import { useWorkspaceAccountSelectorContext } from '../../components/workspaceAccountSelectorProvider';
import { workspaceUtils } from '../../utils/workspaceUtils';

export interface IWorkspaceProposalDetailsPageClientProps {
    /**
     * ID of the workspace account the proposal belongs to, which is also its DAO ID.
     */
    accountId: string;
    /**
     * Slug of the proposal.
     */
    proposalSlug: string;
    /**
     * ID of the workspace, used to keep the breadcrumb inside it.
     */
    workspaceId: string;
}

/**
 * Proposal of one workspace account, rendered by the DAO proposal details page itself.
 *
 * Unlike the workspace dashboard this needs no loading guard: the account is on the URL rather than in the
 * registry, so the page prefetches the DAO and the proposal on the server and the DAO page never renders blank.
 *
 * The account selector picks the account up from the path on its own, so there is nothing to synchronise here.
 */
export const WorkspaceProposalDetailsPageClient: React.FC<
    IWorkspaceProposalDetailsPageClientProps
> = (props) => {
    const { accountId, proposalSlug, workspaceId } = props;

    const { activeOption } = useWorkspaceAccountSelectorContext();

    // Built from the selected account rather than the URL one, so a proposal of a linked account — which the
    // workspace does not hold and the selector therefore cannot select — goes back to the list the reader came
    // from instead of to an account that has no tab.
    const proposalsUrl = workspaceUtils.getWorkspaceUrl(
        workspaceId,
        'proposals',
    );
    const accountParam = activeOption?.id ?? accountId;

    return (
        <DaoProposalDetailsPageClient
            daoId={accountId}
            proposalSlug={proposalSlug}
            proposalsUrl={`${proposalsUrl}?account=${accountParam}`}
        />
    );
};
