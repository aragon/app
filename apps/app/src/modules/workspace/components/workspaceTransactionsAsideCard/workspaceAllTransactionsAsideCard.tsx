'use client';

import { DateFormat, formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { Page } from '@/shared/components/page';
import { StatCard } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useWorkspaceTransactions } from '../../api/workspaceQueryService';
import type { IWorkspaceAccount } from '../../api/workspaceService';
import { buildWorkspaceTransactionListParams } from '../workspaceTransactionList';

export interface IWorkspaceAllTransactionsAsideCardProps {
    /**
     * Accounts the stats cover, i.e. the selection displayed by the list next to the card.
     */
    accounts: IWorkspaceAccount[];
    /**
     * Page size of the transaction list displayed next to the card. The stats are read from the list's own first
     * page, so both must match for the card to add no request.
     */
    pageSize: number;
    /**
     * Title of the card, defaulting to the generic aggregated-view title.
     */
    title?: string;
}

/**
 * Stats of the aggregated transaction view, displayed on the aside of the workspace transactions page.
 *
 * Also serves the account types that have no card of their own — a Safe, today — which is why the accounts it
 * reads are passed in rather than derived: the selection is resolved once by the page.
 */
export const WorkspaceAllTransactionsAsideCard: React.FC<
    IWorkspaceAllTransactionsAsideCardProps
> = (props) => {
    const { accounts, pageSize, title } = props;

    const { t } = useTranslations();

    // Unfiltered first page of the list: it carries the total count, the most recent transaction and the partial
    // flag. Shares its key with the list's own "all" query, so it only adds a request while another type is
    // selected.
    const { data: transactions } = useWorkspaceTransactions(
        buildWorkspaceTransactionListParams(
            accounts.map(({ network, address }) => ({ network, address })),
            pageSize,
        ),
        { enabled: accounts.length > 0 },
    );

    const firstPage = transactions?.pages[0];
    const transactionsCount = firstPage?.metadata.totalRecords;
    const lastActivity = firstPage?.data[0]?.blockTimestamp;

    const formattedCount =
        transactionsCount != null
            ? (formatterUtils.formatNumber(transactionsCount, {
                  format: NumberFormat.GENERIC_SHORT,
              }) ?? '-')
            : '-';

    const formattedLastActivity =
        lastActivity != null
            ? (formatterUtils.formatDate(lastActivity * 1000, {
                  format: DateFormat.RELATIVE,
              }) ?? '-')
            : '-';

    const stats = [
        {
            label: t(
                'app.workspace.workspaceTransactionsAsideCard.transactions',
            ),
            // Unread accounts are missing from the count, so it is only a lower bound.
            value:
                firstPage?.partial && transactionsCount != null
                    ? `${formattedCount}+`
                    : formattedCount,
        },
        {
            label: t(
                'app.workspace.workspaceTransactionsAsideCard.lastActivity',
            ),
            value: formattedLastActivity,
        },
    ];

    const cardTitle =
        title ??
        t('app.workspace.workspaceTransactionsAsideCard.allTransactions');

    return (
        <Page.AsideCard title={cardTitle}>
            <div className="grid w-full grid-cols-2 gap-3">
                {stats.map((stat) => (
                    <StatCard
                        key={stat.label}
                        label={stat.label}
                        value={stat.value}
                    />
                ))}
            </div>
        </Page.AsideCard>
    );
};
