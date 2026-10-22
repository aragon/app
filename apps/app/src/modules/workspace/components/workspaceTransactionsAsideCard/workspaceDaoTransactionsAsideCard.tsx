'use client';

import { DaoFilterAsideCard } from '@/modules/finance/components/daoFilterAsideCard';
import { useDao } from '@/shared/api/daoService';
import type { IDaoFilterOption } from '@/shared/hooks/useDaoFilterUrlParam';
import { useWorkspaceTransactions } from '../../api/workspaceQueryService';
import type { IWorkspaceAccount } from '../../api/workspaceService';
import { buildWorkspaceTransactionListParams } from '../workspaceTransactionList';
import { WorkspaceAllTransactionsAsideCard } from './workspaceAllTransactionsAsideCard';

export interface IWorkspaceDaoTransactionsAsideCardProps {
    /**
     * DAO account selected on the page.
     */
    account: IWorkspaceAccount;
    /**
     * Label of the account, used as the title of the card.
     */
    label: string;
    /**
     * Page size of the transaction list displayed next to the card. The stats are read from the list's own first
     * page, so both must match for the card to add no request.
     */
    pageSize: number;
}

/**
 * Transactions aside card of a DAO account of a workspace, rendering the same card as the DAO transactions page.
 *
 * The workspace exposes one option per account and no aggregation of a DAO with its linked accounts, so the card is
 * always given the parent-DAO option of that single DAO.
 */
export const WorkspaceDaoTransactionsAsideCard: React.FC<
    IWorkspaceDaoTransactionsAsideCardProps
> = (props) => {
    const { account, label, pageSize } = props;

    const { data: dao } = useDao({ urlParams: { id: account.id } });

    // Read here rather than taken as a prop, so the card keeps sharing the list's query key and adds no request.
    const { data: transactions } = useWorkspaceTransactions(
        buildWorkspaceTransactionListParams(
            [{ network: account.network, address: account.address }],
            pageSize,
        ),
    );

    // The whole first page, not just its metadata: the transaction stats read the most recent row out of `data` for
    // the last-activity stat, unlike the asset ones, which only count records.
    const firstPage = transactions?.pages[0];

    // The DAO is still being read on first paint, and its read can fail outright for an account the backend no
    // longer indexes. Either way the plain totals still describe the account, so the aside falls back to them
    // rather than leaving the column blank — which is what it showed before this card existed.
    if (dao == null) {
        return (
            <WorkspaceAllTransactionsAsideCard
                accounts={[account]}
                pageSize={pageSize}
                title={label}
            />
        );
    }

    const activeOption: IDaoFilterOption = {
        id: dao.id,
        label,
        daoId: dao.id,
        isAll: false,
        isParent: true,
    };

    return (
        <DaoFilterAsideCard
            activeOption={activeOption}
            dao={dao}
            selectedMetadata={firstPage}
            statsType="transactions"
        />
    );
};
