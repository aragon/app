'use client';

import { StatCard } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DateFormat, formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import type { ITransactionListStatsProps } from './transactionListStats.api';

export const TransactionListStats: React.FC<ITransactionListStatsProps> = (props) => {
    const { dao, totalTransactions, lastActivityTimestamp, ...otherProps } = props;

    const { t } = useTranslations();

    const subDaoCount = dao.subDaos?.length ?? 0;
    const daoCount = 1 + subDaoCount;

    const formattedTotalTransactions =
        totalTransactions != null
            ? (formatterUtils.formatNumber(totalTransactions, { format: NumberFormat.GENERIC_SHORT }) ?? '-')
            : '-';

    const formattedLastActivity =
        lastActivityTimestamp != null
            ? (formatterUtils.formatDate(lastActivityTimestamp * 1000, { format: DateFormat.RELATIVE }) ?? '-')
            : '-';

    const stats = [
        { label: t('app.finance.transactionListStats.daos'), value: daoCount },
        { label: t('app.finance.transactionListStats.subDaos'), value: subDaoCount },
        { label: t('app.finance.transactionListStats.totalTransactions'), value: formattedTotalTransactions },
        { label: t('app.finance.transactionListStats.lastActivity'), value: formattedLastActivity },
    ];

    return (
        <div className="grid w-full grid-cols-2 gap-3">
            {stats.map((stat) => (
                <StatCard key={stat.label} value={stat.value} label={stat.label} />
            ))}
        </div>
    );
};
