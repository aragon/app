'use client';

import { DateFormat, formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { AllAssetsStats } from '@/modules/finance/components/allAssetsStats';
import { DaoInfoAside } from '@/modules/finance/components/daoInfoAside';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceFilterAsideCardProps } from './workspaceFilterAsideCard.api';

/**
 * Aside card of the workspace finance pages: workspace-wide totals for the "All accounts" view, and the selected
 * account's details for every other option. Mirrors `DaoFilterAsideCard` one level up.
 */
export const WorkspaceFilterAsideCard: React.FC<
    IWorkspaceFilterAsideCardProps
> = (props) => {
    const { activeOption, allAccountsStats, selectedMetadata, statsType } =
        props;

    const { t } = useTranslations();

    if (activeOption.isAllAccounts) {
        const title =
            statsType === 'transactions'
                ? t(
                      'app.workspace.workspaceFilterAsideCard.summary.transactions',
                  )
                : t('app.workspace.workspaceFilterAsideCard.summary.assets');

        return (
            <Page.AsideCard title={title}>
                <AllAssetsStats
                    // A workspace spans several networks, so no single-address treasury link applies.
                    showOctavCta={false}
                    totalAssets={allAccountsStats?.totalRecords}
                    totalValueUsd={allAccountsStats?.totalAmountUsd}
                />
            </Page.AsideCard>
        );
    }

    const { dao, linkedAccount } = activeOption;
    const selectedEntity = linkedAccount ?? dao;

    const stats =
        statsType === 'transactions'
            ? [
                  {
                      label: t(
                          'app.finance.transactionLinkedAccountInfo.transactions',
                      ),
                      value:
                          selectedMetadata != null
                              ? (formatterUtils.formatNumber(
                                    selectedMetadata.metadata.totalRecords,
                                    { format: NumberFormat.GENERIC_SHORT },
                                ) ?? '-')
                              : '-',
                  },
                  {
                      label: t('app.finance.transactionListStats.lastActivity'),
                      value: formatLastActivity(selectedMetadata),
                  },
              ]
            : [
                  {
                      label: t('app.finance.assetListStats.totalValueUsd'),
                      value:
                          selectedEntity != null
                              ? (formatterUtils.formatNumber(
                                    selectedEntity.metrics.tvlUSD,
                                    { format: NumberFormat.FIAT_TOTAL_SHORT },
                                ) ?? '-')
                              : '-',
                  },
                  {
                      label: t('app.finance.assetListStats.tokens'),
                      value:
                          selectedMetadata != null
                              ? (formatterUtils.formatNumber(
                                    selectedMetadata.metadata.totalRecords,
                                    { format: NumberFormat.GENERIC_SHORT },
                                ) ?? '-')
                              : '-',
                  },
              ];

    if (dao == null) {
        return null;
    }

    return (
        <Page.AsideCard title={activeOption.label}>
            <DaoInfoAside
                dao={dao}
                daoId={activeOption.daoId ?? dao.id}
                linkedAccount={linkedAccount}
                network={linkedAccount?.network ?? dao.network}
                stats={stats}
            />
        </Page.AsideCard>
    );
};

const formatLastActivity = (
    selectedMetadata?: IWorkspaceFilterAsideCardProps['selectedMetadata'],
): string => {
    const mostRecent = selectedMetadata?.data[0] as
        | { blockTimestamp?: number }
        | undefined;

    if (mostRecent?.blockTimestamp == null) {
        return '-';
    }

    return (
        formatterUtils.formatDate(mostRecent.blockTimestamp * 1000, {
            format: DateFormat.RELATIVE,
        }) ?? '-'
    );
};
