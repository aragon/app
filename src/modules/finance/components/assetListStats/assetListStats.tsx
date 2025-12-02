'use client';

import { StatCard } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider';
import { formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import type { IAssetListStatsProps } from './assetListStats.api';

export const AssetListStats: React.FC<IAssetListStatsProps> = (props) => {
    const { dao, tokenCount, totalValueUsd } = props;

    const { t } = useTranslations();

    const subDaoCount = dao.subDaos?.length ?? 0;
    const daoCount = 1 + subDaoCount;
    const tokens = tokenCount ?? '—';

    const totalValue = totalValueUsd ?? dao.metrics.tvlUSD;
    const formattedTotalValue =
        formatterUtils.formatNumber(totalValue, { format: NumberFormat.FIAT_TOTAL_SHORT }) ?? '-';

    const stats = [
        { label: t('app.finance.assetListStats.daos'), value: daoCount },
        { label: t('app.finance.assetListStats.subDaos'), value: subDaoCount },
        {
            label: t('app.finance.assetListStats.totalValueUsd'),
            value: formattedTotalValue,
        },
        { label: t('app.finance.assetListStats.tokens'), value: tokens },
    ];

    return (
        <div className="grid w-full grid-cols-2 gap-3">
            {stats.map((stat) => (
                <StatCard key={stat.label} value={stat.value} label={stat.label} />
            ))}
        </div>
    );
};
