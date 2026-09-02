'use client';

import { useAssetList } from '@/modules/finance/api/financeService';
import { AssetList } from '@/modules/finance/components/assetList';
import { useWorkspaceAssetList } from '@/modules/workspace/api/workspaceFinanceService';
import { useWorkspace } from '@/modules/workspace/api/workspaceService';
import { WorkspaceAccountFilter } from '@/modules/workspace/components/workspaceAccountFilter';
import { WorkspaceAssetList } from '@/modules/workspace/components/workspaceAssetList';
import { WorkspaceFilterAsideCard } from '@/modules/workspace/components/workspaceFilterAsideCard';
import { workspaceAccountFilterParam } from '@/modules/workspace/constants/workspaceFilterParam';
import { useWorkspaceFilterUrlParam } from '@/modules/workspace/hooks/useWorkspaceFilterUrlParam';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IWorkspaceAssetsPageClientProps {
    /**
     * ID of the workspace.
     */
    workspaceId: string;
    /**
     * Number of assets to display per page.
     */
    pageSize: number;
}

export const WorkspaceAssetsPageClient: React.FC<
    IWorkspaceAssetsPageClientProps
> = (props) => {
    const { workspaceId, pageSize } = props;

    const { t } = useTranslations();

    const { data: workspace } = useWorkspace({
        urlParams: { id: workspaceId },
    });

    const { activeOption, setActiveOption, options } =
        useWorkspaceFilterUrlParam({
            accounts: workspace?.accounts,
            name: workspaceAccountFilterParam,
        });

    const daoIds = workspace?.accounts.map((account) => account.id) ?? [];
    const allAccountsSelected = activeOption?.isAllAccounts ?? false;

    // Totals of the workspace-wide view. Shares its key with the list's own query, so this adds no extra request.
    const { data: allAccountsStats } = useWorkspaceAssetList(
        { queryParams: { daoIds } },
        { enabled: allAccountsSelected },
    );

    // First page of the selected account, used for its asset count on the aside.
    const { data: selectedAssets } = useAssetList(
        {
            queryParams: {
                daoId: activeOption?.daoId ?? '',
                onlyParent: activeOption?.onlyParent,
                pageSize,
            },
        },
        { enabled: !allAccountsSelected && activeOption?.daoId != null },
    );

    if (activeOption == null || options == null) {
        return null;
    }

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
                    {activeOption.daoId == null ? (
                        <WorkspaceAssetList
                            daoIds={daoIds}
                            pageSize={pageSize}
                        />
                    ) : (
                        <AssetList.Default
                            initialParams={{
                                queryParams: {
                                    daoId: activeOption.daoId,
                                    onlyParent: activeOption.onlyParent,
                                    pageSize,
                                },
                            }}
                        />
                    )}
                </div>
            </Page.Main>
            <Page.Aside>
                <WorkspaceFilterAsideCard
                    activeOption={activeOption}
                    allAccountsStats={allAccountsStats}
                    selectedMetadata={selectedAssets?.pages[0]}
                    statsType="assets"
                />
            </Page.Aside>
        </Page.Content>
    );
};
