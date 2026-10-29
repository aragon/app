'use client';

import { Page } from '@/shared/components/page';
import { StatCard } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceAccount } from '../../api/workspaceService';
import { useWorkspaceTransactionStats } from './useWorkspaceTransactionStats';

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
     * Title of the card, defaulting to the generic aggregated-view title. Set by the DAO card's fallback.
     */
    title?: string;
}

/**
 * Stats of the aggregated transaction view, displayed on the aside of the workspace transactions page.
 *
 * Also the fallback of the DAO card while its DAO is unread, which is why it takes its accounts and title as props.
 */
export const WorkspaceAllTransactionsAsideCard: React.FC<
    IWorkspaceAllTransactionsAsideCardProps
> = (props) => {
    const { accounts, pageSize, title } = props;

    const { t } = useTranslations();

    const stats = useWorkspaceTransactionStats(accounts, pageSize);

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
