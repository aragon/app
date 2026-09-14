'use client';

import { DateFormat, formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { DaoInfoAside } from '@/modules/finance/components/daoInfoAside';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { StatCard } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useWorkspaceTransactions } from '../../api/workspaceQueryService';
import {
    type IWorkspace,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import type { IWorkspaceAccountFilterOption } from '../../hooks/useWorkspaceAccountFilter';
import { buildWorkspaceTransactionListParams } from '../workspaceTransactionList';

export interface IWorkspaceTransactionsAsideCardProps {
    /**
     * Workspace the transactions belong to.
     */
    workspace: IWorkspace;
    /**
     * Account option selected on the page. The whole workspace is described when unset or set to the aggregated
     * option.
     */
    activeOption?: IWorkspaceAccountFilterOption;
    /**
     * Page size of the transaction list displayed next to the card. The stats are read from the list's own first
     * page, so both must match for the card to add no request.
     */
    pageSize: number;
}

/**
 * Aside card of the workspace transactions page. The same transaction stats serve every selection, since they are
 * all read from the workspace endpoint; the metadata around them is the DAO's for a single DAO account and the
 * workspace's otherwise.
 */
export const WorkspaceTransactionsAsideCard: React.FC<
    IWorkspaceTransactionsAsideCardProps
> = (props) => {
    const { workspace, activeOption, pageSize } = props;

    const { t } = useTranslations();

    const selectedAccount = activeOption?.account;
    const isDaoAccountSelected =
        selectedAccount?.type === WorkspaceAccountType.DAO;

    const accounts =
        selectedAccount != null ? [selectedAccount] : workspace.accounts;

    // Unfiltered first page of the list: it carries the total count, the most recent transaction and the partial flag.
    // Shares its key with the list's own "all" query, so it only adds a request while another type is selected.
    const { data: transactions } = useWorkspaceTransactions(
        buildWorkspaceTransactionListParams(
            accounts.map(({ network, address }) => ({ network, address })),
            pageSize,
        ),
        { enabled: accounts.length > 0 },
    );

    // A single DAO account shows the DAO's own metadata, the same one the DAO pages show. A workspace account ID is
    // already the DAO ID, so this shares its key with the DAO the list reads for its execution rows.
    const { data: dao } = useDao(
        { urlParams: { id: selectedAccount?.id ?? '' } },
        { enabled: isDaoAccountSelected },
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

    // The aggregated view describes the workspace itself, so it is titled generically.
    const title =
        selectedAccount != null && activeOption != null
            ? activeOption.label
            : t('app.workspace.workspaceTransactionsAsideCard.allTransactions');

    const renderContent = () => {
        if (isDaoAccountSelected && dao != null) {
            return (
                <DaoInfoAside
                    dao={dao}
                    daoId={dao.id}
                    network={dao.network}
                    stats={stats}
                />
            );
        }

        return (
            <div className="grid w-full grid-cols-2 gap-3">
                {stats.map((stat) => (
                    <StatCard
                        key={stat.label}
                        label={stat.label}
                        value={stat.value}
                    />
                ))}
            </div>
        );
    };

    return <Page.AsideCard title={title}>{renderContent()}</Page.AsideCard>;
};
