'use client';

import { ProposalListStats } from '@/modules/governance/components/proposalListStats';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import type { IWorkspaceAccount } from '../../api/workspaceService';

export interface IWorkspaceDaoProposalsAsideCardProps {
    /**
     * DAO account selected on the page.
     */
    account: IWorkspaceAccount;
    /**
     * Label of the account, used as the title of the card.
     */
    label: string;
    /**
     * Number of proposals the list next to the card reads per page, so the stats describe the same selection the
     * list shows. The stats come off the DAO's own endpoints, not the list's response — see below.
     */
    pageSize: number;
}

/**
 * Proposals aside card of a DAO account of a workspace, rendering the same stats as the DAO proposals page.
 *
 * It reads the DAO's own endpoints while the list beside it reads the workspace aggregate narrowed to this one
 * account, so the two could disagree if the backend ever treated them differently — the same gap the assets page
 * accepts between its tabs. It is worth it for the parity: these are the stats of the DAO proposals page, including
 * the ones the aggregated card has to omit. It costs two requests of its own (`ProposalListStats` reads the
 * proposals, then the executed ones), so an account scope makes three proposal requests where the DAO page makes
 * two: there the stats share the list's own query key, which cannot happen across two endpoints.
 *
 * Always the DAO-level stats: a selected process is described by `WorkspaceProcessProposalsAsideCard` instead,
 * which the dispatcher reaches first.
 */
export const WorkspaceDaoProposalsAsideCard: React.FC<
    IWorkspaceDaoProposalsAsideCardProps
> = (props) => {
    const { account, label, pageSize } = props;

    // A workspace account ID is already the DAO ID, so this shares its key with the DAO pages' own query.
    const { data: dao } = useDao({ urlParams: { id: account.id } });

    if (dao == null) {
        return null;
    }

    // The same selection the list beside the card reads, so the stats describe exactly what it shows. Deliberately
    // without the DAO page's `onlyActive`, which keeps only the proposals of currently installed plugins: the
    // workspace endpoint has no equivalent filter, so asking for it here would make this total read lower than the
    // rows the list pages through right next to it. Agreeing with that list matters more than matching the total of
    // the DAO proposals page, which is another screen.
    const initialParams = {
        queryParams: {
            daoId: account.id,
            pageSize,
            sort: 'blockTimestamp',
            isSubProposal: false,
            includeLinkedAccounts: false,
        },
    };

    return (
        <Page.AsideCard title={label}>
            <ProposalListStats dao={dao} initialParams={initialParams} />
        </Page.AsideCard>
    );
};
