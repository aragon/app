'use client';

import { formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import type { IStatCardProps } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceAssetListMetadata } from '../../api/workspaceQueryService';

/**
 * Asset stats of a selection (total value, tokens and hidden spam when any), shared by the aside cards of the
 * workspace assets page.
 */
export const useWorkspaceAssetStats = (
    metadata?: IWorkspaceAssetListMetadata,
): IStatCardProps[] => {
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

    return stats;
};
