'use client';

import { DateFormat, formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import type { IStatCardProps } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useWorkspaceTransactions } from '../../api/workspaceQueryService';
import type { IWorkspaceAccount } from '../../api/workspaceService';
import { workspaceCoverageUtils } from '../../utils/workspaceCoverageUtils';
import { buildWorkspaceTransactionListParams } from '../workspaceTransactionList';

/**
 * Transaction stats of the given accounts (count and last activity), shared by the aside cards of the workspace
 * transactions page.
 *
 * Read from the unfiltered first page of the list, which carries the total count, the most recent transaction and
 * the coverage. It shares its key with the list's own query, so it only adds a request while the list is filtered by
 * type.
 */
export const useWorkspaceTransactionStats = (
    accounts: IWorkspaceAccount[],
    pageSize: number,
): IStatCardProps[] => {
    const { t } = useTranslations();

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

    return [
        {
            label: t(
                'app.workspace.workspaceTransactionsAsideCard.transactions',
            ),
            // Transactions of an account not fully read are missing from the count, so it is only a lower bound.
            value:
                workspaceCoverageUtils.hasIncompleteCount(
                    firstPage?.coverage,
                ) && transactionsCount != null
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
};
