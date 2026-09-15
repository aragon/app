'use client';

import { formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { Page } from '@/shared/components/page';
import { StatCard } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IWorkspaceAssetsAsideCardProps {
    /**
     * Title of the card, i.e. the label of the selected tab.
     */
    title: string;
    /**
     * Number of assets of the selection.
     */
    assetsCount?: number;
    /**
     * Value in USD of the whole selection, not just of the loaded page. Only the aggregated view reports it.
     */
    totalAmountUsd?: string;
    /**
     * Number of spam-flagged tokens hidden from the selection. Only the aggregated view reports it.
     */
    spamCount?: number;
}

/**
 * Stats of the aggregated asset view, displayed on the aside of the workspace assets page.
 *
 * Uses the same `StatCard` grid as the DAO aside cards (`AllAssetsStats`, `DaoInfoAside`), so the two pages read
 * alike. The account tabs render the DAO's own aside card instead.
 */
export const WorkspaceAssetsAsideCard: React.FC<
    IWorkspaceAssetsAsideCardProps
> = (props) => {
    const { title, assetsCount, totalAmountUsd, spamCount } = props;

    const { t } = useTranslations();

    const formatCount = (value?: number) =>
        value != null
            ? (formatterUtils.formatNumber(value, {
                  format: NumberFormat.GENERIC_SHORT,
              }) ?? '-')
            : '-';

    const stats = [
        {
            label: t('app.workspace.workspaceAssetsAsideCard.totalValue'),
            value:
                totalAmountUsd != null
                    ? (formatterUtils.formatNumber(totalAmountUsd, {
                          format: NumberFormat.FIAT_TOTAL_SHORT,
                      }) ?? '-')
                    : '-',
        },
        {
            label: t('app.workspace.workspaceAssetsAsideCard.tokens'),
            value: formatCount(assetsCount),
        },
    ];

    if (spamCount != null && spamCount > 0) {
        stats.push({
            label: t('app.workspace.workspaceAssetsAsideCard.hiddenSpam'),
            value: formatCount(spamCount),
        });
    }

    return (
        <Page.AsideCard title={title}>
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
