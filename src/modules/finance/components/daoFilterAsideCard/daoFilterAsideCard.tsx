'use client';

import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DateFormat, formatterUtils, invariant, NumberFormat } from '@aragon/gov-ui-kit';
import { AllAssetsStats } from '../allAssetsStats';
import { DaoInfoAside } from '../daoInfoAside';
import type { IDaoFilterAsideCardProps } from './daoFilterAsideCard.api';

export const DaoFilterAsideCard: React.FC<IDaoFilterAsideCardProps> = (props) => {
    const { dao, activeOption, selectedMetadata, allMetadata, statsType } = props;
    const { t } = useTranslations();

    invariant(activeOption != null, 'DaoFilterAsideCard: no valid DAO filter option found.');

    const isAllSelected = activeOption.isAll;
    const asideCardTitle = activeOption.isAll
        ? statsType === 'transactions'
            ? t('app.finance.daoTransactionsPage.aside.summary')
            : t('app.finance.daoAssetsPage.aside.summary')
        : activeOption.label;

    // Get selected DAO (parent or SubDAO)
    const selectedDaoId = activeOption.daoId ?? dao.id;
    const matchingSubDao = dao.subDaos?.find((subDao) => subDao.id === selectedDaoId);
    const selectedDao = activeOption.isParent ? dao : (matchingSubDao ?? dao);

    // Build stats for specific DAO view
    const specificStats = (() => {
        if (statsType === 'transactions') {
            if (!selectedMetadata) {
                return [
                    {
                        label: t('app.finance.transactionSubDaoInfo.transactions'),
                        value: '-',
                    },
                    {
                        label: t('app.finance.transactionListStats.lastActivity'),
                        value: '-',
                    },
                ];
            }

            const totalTransactions = selectedMetadata.metadata.totalRecords;
            const mostRecentTransaction = selectedMetadata.data[0] as { blockTimestamp?: number } | undefined;
            const lastActivityTimestamp = mostRecentTransaction?.blockTimestamp;

            const formattedTransactionsCount =
                formatterUtils.formatNumber(totalTransactions, { format: NumberFormat.GENERIC_SHORT }) ?? '-';
            const formattedLastActivity =
                lastActivityTimestamp != null
                    ? (formatterUtils.formatDate(lastActivityTimestamp * 1000, { format: DateFormat.RELATIVE }) ?? '-')
                    : '-';

            return [
                {
                    label: t('app.finance.transactionSubDaoInfo.transactions'),
                    value: formattedTransactionsCount,
                },
                {
                    label: t('app.finance.transactionListStats.lastActivity'),
                    value: formattedLastActivity,
                },
            ];
        } else {
            // assets
            const asideMetrics = selectedDao.metrics;
            const selectedAssetCount = selectedMetadata?.metadata.totalRecords;

            return [
                {
                    label: t('app.finance.assetListStats.totalValueUsd'),
                    value:
                        formatterUtils.formatNumber(asideMetrics.tvlUSD, {
                            format: NumberFormat.FIAT_TOTAL_SHORT,
                        }) ?? asideMetrics.tvlUSD,
                },
                {
                    label: t('app.finance.assetListStats.tokens'),
                    value:
                        selectedAssetCount != null
                            ? (formatterUtils.formatNumber(selectedAssetCount, {
                                  format: NumberFormat.GENERIC_SHORT,
                              }) ?? selectedAssetCount)
                            : '-',
                },
            ];
        }
    })();

    // Get totalAssets for "All" view
    const totalAssets = allMetadata?.metadata.totalRecords;

    return (
        <Page.AsideCard title={asideCardTitle}>
            {isAllSelected && <AllAssetsStats dao={dao} totalValueUsd={dao.metrics.tvlUSD} totalAssets={totalAssets} />}
            {!isAllSelected && (
                <DaoInfoAside
                    daoId={selectedDaoId}
                    network={dao.network}
                    dao={dao}
                    subDao={matchingSubDao}
                    stats={specificStats}
                />
            )}
        </Page.AsideCard>
    );
};
