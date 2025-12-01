'use client';

import { StatCard } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IAssetListStatsProps } from './assetListStats.api';

export const AssetListStats: React.FC<IAssetListStatsProps> = (props) => {
    const { dao, tokenCount, totalValueUsd, ...otherProps } = props;

    const { t } = useTranslations();

    const subDaoCount = dao.subDaos?.length ?? 0;
    const daoCount = 1 + subDaoCount;
    const totalValue = totalValueUsd ?? dao.metrics?.tvlUSD ?? '—';
    const tokens = tokenCount ?? '—';

    const stats = [
        { label: t('app.finance.assetListStats.daos'), value: daoCount },
        { label: t('app.finance.assetListStats.subDaos'), value: subDaoCount },
        { label: t('app.finance.assetListStats.totalValueUsd'), value: totalValue },
        { label: t('app.finance.assetListStats.tokens'), value: tokens },
    ];

    return (
        <div className="flex w-full flex-col gap-y-4" {...otherProps}>
            <div className="grid w-full grid-cols-2 gap-3">
                {stats.map((stat) => (
                    <StatCard key={stat.label} value={stat.value} label={stat.label} />
                ))}
            </div>
            <p className="text-sm text-neutral-500">{t('app.finance.assetListStats.note')}</p>
        </div>
    );
};
