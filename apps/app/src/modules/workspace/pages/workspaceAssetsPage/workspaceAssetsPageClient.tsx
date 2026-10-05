'use client';

import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useWorkspace } from '../../api/workspaceService';
import { WorkspaceAssetList } from '../../components/workspaceAssetList';
import { WorkspaceAssetsAsideCard } from '../../components/workspaceAssetsAsideCard';
import { useWorkspaceAccountOptions } from '../../hooks/useWorkspaceAccountOptions';
import { useWorkspaceAssetListData } from '../../hooks/useWorkspaceAssetListData';
import { workspaceUtils } from '../../utils/workspaceUtils';

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
 * Assets of a workspace, scoped to the account on the route.
 *
 * Every scope reads the workspace query API, the aggregated one over all accounts and an account over just that
 * one. Going through the same endpoint throughout keeps the accounts summing to the aggregated view, since both
 * come out of the same aggregation.
 */
export const WorkspaceAssetsPageClient: React.FC<
    IWorkspaceAssetsPageClientProps
> = (props) => {
    const { workspaceId, pageSize } = props;

    const { t } = useTranslations();

    const { data: workspace, isPending: isWorkspacePending } = useWorkspace({
        urlParams: { id: workspaceId },
    });

    const { accountId, activeOption } = useWorkspaceAccountOptions();

    const accounts = workspace?.accounts ?? [];

    // Every account of the workspace, or just the one the route names. Read from the route rather than from the
    // active option because only DAO accounts become options, so a Safe has none of its own.
    const account = workspaceUtils.findAccountById(accounts, accountId);

    const accountsToDisplay = (account != null ? [account] : accounts).map(
        ({ network, address }) => ({
            network,
            address,
        }),
    );

    // Totals of the selection. Shares its key with the list's own query, so this adds no extra request.
    const { metadata } = useWorkspaceAssetListData(
        { body: { accounts: accountsToDisplay, pagination: { pageSize } } },
        { enabled: accountsToDisplay.length > 0 },
    );

    return (
        <Page.Content>
            <Page.Main
                title={t('app.workspace.workspaceAssetsPage.main.title')}
            >
                <WorkspaceAssetList
                    accounts={accountsToDisplay}
                    isPending={isWorkspacePending}
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
