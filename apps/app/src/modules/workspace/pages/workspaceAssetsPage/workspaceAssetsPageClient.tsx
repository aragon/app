'use client';

import { useAssetList } from '@/modules/finance/api/financeService';
import { AssetList } from '@/modules/finance/components/assetList';
import { DaoFilterAsideCard } from '@/modules/finance/components/daoFilterAsideCard';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useWorkspaceAccounts } from '../../api/workspaceQueryService';
import { useWorkspace } from '../../api/workspaceService';
import { WorkspaceAccountFilter } from '../../components/workspaceAccountFilter';
import { WorkspaceAssetList } from '../../components/workspaceAssetList';
import { WorkspaceAssetsAsideCard } from '../../components/workspaceAssetsAsideCard';
import { useWorkspaceAccountFilter } from '../../hooks/useWorkspaceAccountFilter';
import { useWorkspaceAssetListData } from '../../hooks/useWorkspaceAssetListData';

export interface IWorkspaceAssetsPageClientProps {
    /**
     * ID of the workspace.
     */
    workspaceId: string;
    /**
     * Number of assets to read per page.
     */
    pageSize: number;
}

/**
 * Assets of a workspace, laid out like the DAO assets page: one tab per account plus an aggregated one.
 *
 * The per-account tabs read the single DAO endpoints, so their numbers match the DAO page exactly. The aggregated
 * tab is the only one that needs the workspace query API, because it is the only view that spans networks.
 */
export const WorkspaceAssetsPageClient: React.FC<
    IWorkspaceAssetsPageClientProps
> = (props) => {
    const { workspaceId, pageSize } = props;

    const { t } = useTranslations();

    const { data: workspace } = useWorkspace(
        { urlParams: { id: workspaceId } },
        { retry: false },
    );

    const accounts = workspace?.accounts ?? [];
    const accountRefs = accounts.map(({ network, address }) => ({
        network,
        address,
    }));

    // Resolved once to label the tabs with the indexed DAO names, shared with the overview page's cache.
    const { data: accountInfos } = useWorkspaceAccounts(
        { body: { accounts: accountRefs } },
        { enabled: accounts.length > 0 },
    );

    const { activeOption, setActiveOption, options } =
        useWorkspaceAccountFilter({
            accounts,
            accountInfos,
            allAccountsLabel: t(
                'app.workspace.workspaceAssetsPage.filter.allAccounts',
            ),
        });

    const isAllAccounts = activeOption?.isAllAccounts ?? true;

    // Totals of the aggregated view. Shares its key with the list's own query, so this adds no extra request.
    const { metadata: allAccountsMetadata } = useWorkspaceAssetListData(
        { body: { accounts: accountRefs, pagination: { pageSize } } },
        { enabled: isAllAccounts && accounts.length > 0 },
    );

    const selectedAccount = activeOption?.account;

    // First page of the selected account, read for the asset count of its aside card.
    const { data: selectedAssets } = useAssetList(
        {
            queryParams: { daoId: selectedAccount?.id ?? '', pageSize },
        },
        { enabled: selectedAccount != null },
    );

    // The account tabs show the DAO's own aside card, the same one the DAO assets page shows.
    const { data: selectedDao } = useDao(
        { urlParams: { id: selectedAccount?.id ?? '' } },
        { enabled: selectedAccount != null },
    );

    return (
        <Page.Content>
            <Page.Main
                title={t('app.workspace.workspaceAssetsPage.main.title')}
            >
                <div className="flex flex-col gap-4 md:gap-6">
                    <WorkspaceAccountFilter
                        onSelect={setActiveOption}
                        options={options}
                        value={activeOption}
                    />
                    {selectedAccount == null ? (
                        <WorkspaceAssetList
                            accounts={accountRefs}
                            pageSize={pageSize}
                        />
                    ) : (
                        <AssetList.Default
                            initialParams={{
                                queryParams: {
                                    daoId: selectedAccount.id,
                                    pageSize,
                                },
                            }}
                        />
                    )}
                </div>
            </Page.Main>
            <Page.Aside>
                {selectedAccount == null ? (
                    <WorkspaceAssetsAsideCard
                        assetsCount={allAccountsMetadata?.totalRecords}
                        spamCount={allAccountsMetadata?.spamCount}
                        title={
                            activeOption?.label ??
                            t(
                                'app.workspace.workspaceAssetsPage.filter.allAccounts',
                            )
                        }
                        totalAmountUsd={allAccountsMetadata?.totalAmountUsd}
                    />
                ) : (
                    selectedDao != null && (
                        <DaoFilterAsideCard
                            activeOption={{
                                id: selectedAccount.id,
                                label: activeOption?.label ?? '',
                                daoId: selectedAccount.id,
                                isAll: false,
                                // The account is a DAO in its own right, not a linked account of another one, so
                                // the card reads its stats from the DAO itself.
                                isParent: true,
                            }}
                            dao={selectedDao}
                            selectedMetadata={selectedAssets?.pages[0]}
                            statsType="assets"
                        />
                    )
                )}
            </Page.Aside>
        </Page.Content>
    );
};
