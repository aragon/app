'use client';

import {
    Card,
    DataListContainer,
    DataListRoot,
    EmptyState,
    MemberDataListItem,
} from '@aragon/gov-ui-kit';
import { DaoMembersPageClient } from '@/modules/governance/pages/daoMembersPage';
import type { IFeaturedDelegates } from '@/shared/api/cmsService';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useWorkspaceAccounts } from '../../api/workspaceQueryService';
import { useWorkspace } from '../../api/workspaceService';
import { WorkspaceAccountDropdown } from '../../components/workspaceAccountFilter';
import { useWorkspaceAccountFilter } from '../../hooks/useWorkspaceAccountFilter';

export interface IWorkspaceMembersPageClientProps {
    /**
     * ID of the workspace to display the members of.
     */
    workspaceId: string;
    /**
     * Number of members to read per page.
     */
    pageSize: number;
    /**
     * Featured delegates config from CMS, forwarded to the DAO members page.
     */
    featuredDelegates: IFeaturedDelegates[];
}

export const WorkspaceMembersPageClient: React.FC<
    IWorkspaceMembersPageClientProps
> = (props) => {
    const { workspaceId, pageSize, featuredDelegates } = props;

    const { t } = useTranslations();

    const {
        data: workspace,
        isPending: isWorkspacePending,
        isError: isWorkspaceError,
    } = useWorkspace({ urlParams: { id: workspaceId } }, { retry: false });

    const accounts = workspace?.accounts ?? [];
    const accountRefs = accounts.map(({ network, address }) => ({
        network,
        address,
    }));

    // Resolved once to label the options with the indexed DAO names, shared with the overview page's cache.
    const { data: accountInfos } = useWorkspaceAccounts(
        {
            body: { accounts: accountRefs },
        },
        { enabled: accounts.length > 0 },
    );

    // Members are read one DAO at a time, so there is no aggregated option: the first DAO account is selected
    // until another one is set on the URL.
    const { activeOption, setActiveOption, options } =
        useWorkspaceAccountFilter({ accounts, accountInfos });

    const activeAccount = activeOption?.account;

    // The DAO members page renders nothing until its DAO resolves, since the DAO page prefetches it on the server.
    // It is read here under the same query key, so it adds no request, and the page is handed over once it resolves.
    const { isPending: isDaoPending } = useDao(
        { urlParams: { id: activeAccount?.id ?? '' } },
        { enabled: activeAccount != null && activeAccount.type === 'DAO' },
    );

    const isLoading =
        isWorkspacePending || (activeAccount != null && isDaoPending);

    if (isWorkspaceError) {
        return (
            <Page.Main>
                <Card className="border border-neutral-100 py-10">
                    <EmptyState
                        description={t(
                            'app.workspace.workspaceMembersPage.notFound.description',
                            { id: workspaceId },
                        )}
                        heading={t(
                            'app.workspace.workspaceMembersPage.notFound.title',
                        )}
                        objectIllustration={{ object: 'MAGNIFYING_GLASS' }}
                    />
                </Card>
            </Page.Main>
        );
    }

    // A disabled query reads as pending, so the DAO is only waited on once there is an account to read it for.
    // This would not be necessary when the page is server-rendered
    if (isLoading) {
        return (
            <Page.Content>
                <Page.Main
                    title={t('app.workspace.workspaceMembersPage.main.title')}
                >
                    {activeAccount != null && (
                        <WorkspaceAccountDropdown
                            onSelect={setActiveOption}
                            options={options}
                            value={activeOption}
                        />
                    )}
                    <DataListRoot
                        entityLabel={t('app.governance.daoMemberList.entity')}
                        itemsCount={0}
                        pageSize={pageSize}
                        state="initialLoading"
                    >
                        <DataListContainer
                            layoutClassName="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                            SkeletonElement={MemberDataListItem.Skeleton}
                        />
                    </DataListRoot>
                </Page.Main>
                {/* Reserves the aside column of the DAO members page, so the skeleton cards are as wide as the
                    member cards they stand in for. */}
                <Page.Aside />
            </Page.Content>
        );
    }

    // The workspace has no DAO account, so there is no body and no membership to show.
    if (activeAccount == null) {
        return (
            <Page.Content>
                <Page.Main
                    title={t('app.workspace.workspaceMembersPage.main.title')}
                >
                    <Card className="border border-neutral-100 py-10">
                        <EmptyState
                            description={t(
                                'app.workspace.workspaceMembersPage.emptyState.description',
                            )}
                            heading={t(
                                'app.workspace.workspaceMembersPage.emptyState.heading',
                            )}
                            objectIllustration={{
                                object: 'MAGNIFYING_GLASS',
                            }}
                        />
                    </Card>
                </Page.Main>
            </Page.Content>
        );
    }

    // A workspace DAO account ID is its DAO ID, so the account is handed to the DAO members page as is. Keyed by
    // account so switching accounts resets the body tab and featured delegates state of the previous DAO. The
    // member list owns its loading state from here.
    return (
        <Page.Content>
            <DaoMembersPageClient
                featuredDelegates={featuredDelegates}
                initialParams={{
                    queryParams: { daoId: activeAccount.id, pageSize },
                }}
                key={activeAccount.id}
            >
                <WorkspaceAccountDropdown
                    onSelect={setActiveOption}
                    options={options}
                    value={activeOption}
                />
            </DaoMembersPageClient>
        </Page.Content>
    );
};
