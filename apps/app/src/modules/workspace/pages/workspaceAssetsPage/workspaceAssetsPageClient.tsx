'use client';

import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WorkspaceAccountStateCard } from '../../components/workspaceAccountStateCard';
import { WorkspaceAssetList } from '../../components/workspaceAssetList';
import { WorkspaceAssetsAsideCard } from '../../components/workspaceAssetsAsideCard';
import { useWorkspaceAccountOptions } from '../../hooks/useWorkspaceAccountOptions';
import { useWorkspaceAssetListData } from '../../hooks/useWorkspaceAssetListData';

export interface IWorkspaceAssetsPageClientProps {
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
    const { pageSize } = props;

    const { t } = useTranslations();

    // Every account of the workspace, or just the one the route names, held by the workspace or not.
    const { activeOption, scopedAccounts, isPending, refetchExternalAccount } =
        useWorkspaceAccountOptions();

    // An account the workspace does not hold that the lookup could not place as a DAO or a Safe: there is nothing to
    // list, so the page says what the account is instead of an empty list.
    const isUnresolvedExternal =
        activeOption?.isExternal === true &&
        activeOption.account == null &&
        !isPending;

    const accountsToDisplay = scopedAccounts.map(({ network, address }) => ({
        network,
        address,
    }));

    // Totals of the selection. Shares its key with the list's own query, so this adds no extra request.
    const { metadata } = useWorkspaceAssetListData(
        { body: { accounts: accountsToDisplay, pagination: { pageSize } } },
        { enabled: accountsToDisplay.length > 0 },
    );

    if (isUnresolvedExternal) {
        return (
            <Page.Content>
                <Page.Main
                    title={t('app.workspace.workspaceAssetsPage.main.title')}
                >
                    <WorkspaceAccountStateCard
                        accountState={activeOption.accountState}
                        onRetry={refetchExternalAccount}
                    />
                </Page.Main>
            </Page.Content>
        );
    }

    return (
        <Page.Content>
            <Page.Main
                title={t('app.workspace.workspaceAssetsPage.main.title')}
            >
                <WorkspaceAssetList
                    accounts={accountsToDisplay}
                    isPending={isPending}
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
