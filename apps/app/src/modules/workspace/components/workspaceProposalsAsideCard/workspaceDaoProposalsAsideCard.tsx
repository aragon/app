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
     * Number of proposals the list next to the card reads per page. The stats are read under the same key, so both
     * must match for the card to add no request.
     */
    pageSize: number;
}

/**
 * Proposals aside card of a DAO account of a workspace, rendering the same stats as the DAO proposals page.
 *
 * The account tab reads the single DAO endpoints, so its aside reads them too: the numbers of the card and of the
 * list beside it then come from the same source. Always the DAO-level stats — the page does not lift the process
 * filter to swap in `DaoPluginInfo`.
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

    // The same parameters the list beside the card reads, so the stats describe exactly what it shows.
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
