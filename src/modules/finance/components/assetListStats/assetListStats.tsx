'use client';

import { StatCard } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IAssetListStatsProps } from './assetListStats.api';

export const AssetListStats: React.FC<IAssetListStatsProps> = (props) => {
    const { dao } = props;

    const { t } = useTranslations();

    // TODO: Calculate aggregate stats across all SubDAOs
    // For now, showing basic counts
    const subDaoCount = dao?.plugins?.filter((p) => p.isSubPlugin).length ?? 0;
    const bodyCount = dao?.plugins?.filter((p) => p.isBody).length ?? 0;

    const stats = [
        { label: t('app.finance.assetListStats.bodies'), value: bodyCount },
        { label: t('app.finance.assetListStats.subDaos'), value: subDaoCount },
    ];

    return (
        <div className="flex w-full flex-col gap-y-4">
            <div className="grid w-full grid-cols-2 gap-3">
                {stats.map((stat) => (
                    <StatCard key={stat.label} value={stat.value} label={stat.label} />
                ))}
            </div>
            <p className="text-sm text-neutral-500">{t('app.finance.assetListStats.note')}</p>
        </div>
    );
};
