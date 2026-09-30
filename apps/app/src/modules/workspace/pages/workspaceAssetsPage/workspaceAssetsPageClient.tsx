'use client';

import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useWorkspace } from '../../api/workspaceService';
import { WorkspaceAssetList } from '../../components/workspaceAssetList';
import { WorkspaceAssetsAsideCard } from '../../components/workspaceAssetsAsideCard';
import { useWorkspaceAccountOptions } from '../../hooks/useWorkspaceAccountOptions';
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
 * Assets of a workspace, filtered by the account picked on the workspace navigation.
 *
 * Every selection reads the workspace query API, "All accounts" over all accounts and a single account over just
 * that one. Going through the same endpoint throughout keeps the accounts summing to the aggregated view, since both
 * come out of the same aggregation. Safe accounts cannot be selected, so their balances show up only inside the
 * aggregated view.
 */
export const WorkspaceAssetsPageClient: React.FC<
    IWorkspaceAssetsPageClientProps
> = (props) => {
    const { workspaceId, pageSize } = props;

    const { t } = useTranslations();

    const { data: workspace } = useWorkspace({
        urlParams: { id: workspaceId },
    });

    const accounts = workspace?.accounts ?? [];

    const { activeOption } = useWorkspaceAccountOptions();

    const accountsToDisplay = accounts;

    const accountRefsToDisplay = accountsToDisplay.map(
        ({ network, address }) => ({ network, address }),
    );

    // Totals of the selection. Shares its key with the list's own query, so this adds no extra request.
    const { metadata } = useWorkspaceAssetListData(
        { body: { accounts: accountRefsToDisplay, pagination: { pageSize } } },
        { enabled: accountRefsToDisplay.length > 0 },
    );

    return (
        <Page.Content>
            <Page.Main
                title={t('app.workspace.workspaceAssetsPage.main.title')}
            >
                <WorkspaceAssetList
                    accounts={accountRefsToDisplay}
                    pageSize={pageSize}
                />
            </Page.Main>
            <Page.Aside>
                <WorkspaceAssetsAsideCard
                    activeOption={activeOption}
                    metadata={metadata}
                />
            </Page.Aside>
        </Page.Content>
    );
};
