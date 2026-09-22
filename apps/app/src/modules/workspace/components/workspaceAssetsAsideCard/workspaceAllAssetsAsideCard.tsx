'use client';

import { formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { Page } from '@/shared/components/page';
import { StatCard } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceAssetListMetadata } from '../../api/workspaceQueryService';

export interface IWorkspaceAllAssetsAsideCardProps {
    /**
     * Totals of the selection, as reported by the workspace asset list endpoint.
     */
    metadata?: IWorkspaceAssetListMetadata;
    /**
     * Title of the card, defaulting to the generic aggregated-view title.
     */
    title?: string;
}

/**
 * Stats of the aggregated asset view, displayed on the aside of the workspace assets page.
 *
 * Uses the same `StatCard` grid as the DAO aside cards (`AllAssetsStats`, `DaoInfoAside`), so the two pages read
 * alike. Accounts of any type contribute to it, since they are all read from the same workspace endpoint.
 */
export const WorkspaceAllAssetsAsideCard: React.FC<
    IWorkspaceAllAssetsAsideCardProps
> = (props) => {
    const { metadata, title } = props;

    const { t } = useTranslations();

    const formatCount = (value?: number) =>
        value != null
            ? (formatterUtils.formatNumber(value, {
                  format: NumberFormat.GENERIC_SHORT,
              }) ?? '-')
            : '-';

    const { totalAmountUsd, totalRecords, spamCount } = metadata ?? {};

    const stats = [
        {
            label: t('app.workspace.workspaceAllAssetsAsideCard.totalValue'),
            value:
                totalAmountUsd != null
                    ? (formatterUtils.formatNumber(totalAmountUsd, {
                          format: NumberFormat.FIAT_TOTAL_SHORT,
                      }) ?? '-')
                    : '-',
        },
        {
            label: t('app.workspace.workspaceAllAssetsAsideCard.tokens'),
            value: formatCount(totalRecords),
        },
    ];

    if (spamCount != null && spamCount > 0) {
        stats.push({
            label: t('app.workspace.workspaceAllAssetsAsideCard.hiddenSpam'),
            value: formatCount(spamCount),
        });
    }

    const cardTitle =
        title ?? t('app.workspace.workspaceAllAssetsAsideCard.allAssets');

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
