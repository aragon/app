'use client';

import type { IDao } from '@/shared/api/daoService';
import { StatCard } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, formatterUtils, IconType, NumberFormat } from '@aragon/gov-ui-kit';

export interface IAllAssetsStatsProps {
    /**
     * DAO used to derive the Octav link (address).
     */
    dao?: IDao;
    /**
     * Total value of all assets in USD.
     */
    totalValueUsd?: string | number;
    /**
     * Total amount of assets across DAO and SubDAOs.
     */
    totalAssets?: number;
    /**
     * Override for the Octav link, if needed.
     */
    octavLink?: string;
    /**
     * Toggle Octav CTA rendering.
     */
    showOctavCta?: boolean;
}

export const AllAssetsStats: React.FC<IAllAssetsStatsProps> = ({
    dao,
    totalValueUsd,
    totalAssets,
    octavLink,
    showOctavCta = true,
}) => {
    const { t } = useTranslations();

    const formattedTotalValue =
        totalValueUsd != null
            ? (formatterUtils.formatNumber(totalValueUsd, { format: NumberFormat.FIAT_TOTAL_SHORT }) ?? '-')
            : '-';
    const formattedTotalAssets =
        totalAssets != null
            ? (formatterUtils.formatNumber(totalAssets, { format: NumberFormat.GENERIC_SHORT }) ?? '-')
            : '-';

    const stats = [
        {
            label: t('app.finance.assetListStats.totalValueUsd'),
            value: formattedTotalValue,
        },
        {
            label: t('app.finance.assetListStats.tokens'),
            value: formattedTotalAssets,
        },
    ];

    const resolvedOctavLink = octavLink ?? (dao?.address ? `https://pro.octav.fi/?addresses=${dao.address}` : null);

    return (
        <div className="flex flex-col gap-6">
            <div className="grid w-full grid-cols-2 gap-3">
                {stats.map((stat) => (
                    <StatCard key={stat.label} value={stat.value} label={stat.label} />
                ))}
            </div>
            {showOctavCta && resolvedOctavLink && (
                <div className="flex flex-col items-center gap-y-3">
                    <Button
                        className="w-full"
                        variant="tertiary"
                        size="md"
                        href={resolvedOctavLink}
                        target="_blank"
                        iconRight={IconType.LINK_EXTERNAL}
                    >
                        {t('app.finance.financeDetailsList.octavLabel')}
                    </Button>
                    <p className="text-sm text-neutral-500">{t('app.finance.financeDetailsList.octavDescription')}</p>
                </div>
            )}
        </div>
    );
};
