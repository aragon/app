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
import { useWorkspaceAccountSelectorContext } from '../../components/workspaceAccountSelectorProvider';

export interface IWorkspaceMembersPageClientProps {
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
    const { pageSize, featuredDelegates } = props;

    const { t } = useTranslations();

    const { activeOption, options } = useWorkspaceAccountSelectorContext();

    const activeAccount = activeOption?.account;
    const hasDaoAccounts = options.some((option) => !option.isAllAccounts);

    // The DAO members page renders nothing until its DAO resolves, since the DAO page prefetches it on the server.
    // It is read here under the same query key, so it adds no request, and the page is handed over once it resolves.
    const { isPending: isDaoPending, isError: isDaoError } = useDao(
        { urlParams: { id: activeAccount?.id ?? '' } },
        { enabled: activeAccount != null },
    );

    // The workspace has no DAO account, so there is no body and no membership to show.
    if (!hasDaoAccounts) {
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

    // Members are read one DAO at a time, so there is nothing to show until a DAO account is selected.
    if (activeAccount == null) {
        return (
            <Page.Content>
                <Page.Main
                    title={t('app.workspace.workspaceMembersPage.main.title')}
                >
                    <Card className="border border-neutral-100 py-10">
                        <EmptyState
                            description={t(
                                'app.workspace.workspaceMembersPage.selectAccount.description',
                            )}
                            heading={t(
                                'app.workspace.workspaceMembersPage.selectAccount.heading',
                            )}
                            objectIllustration={{ object: 'USERS' }}
                        />
                    </Card>
                </Page.Main>
            </Page.Content>
        );
    }

    // The DAO members page must not be mounted for a DAO that failed to load: its own reads of the DAO would refetch
    // the failed query on mount, which reads as pending again and would swap it back for the skeleton in a loop.
    if (isDaoError) {
        return (
            <Page.Content>
                <Page.Main
                    title={t('app.workspace.workspaceMembersPage.main.title')}
                >
                    <Card className="border border-neutral-100 py-10">
                        <EmptyState
                            description={t(
                                'app.workspace.workspaceMembersPage.daoError.description',
                            )}
                            heading={t(
                                'app.workspace.workspaceMembersPage.daoError.heading',
                            )}
                            objectIllustration={{ object: 'WARNING' }}
                        />
                    </Card>
                </Page.Main>
            </Page.Content>
        );
    }

    // This would not be necessary when the page is server-rendered.
    if (isDaoPending) {
        return (
            <Page.Content>
                <Page.Main
                    title={t('app.workspace.workspaceMembersPage.main.title')}
                >
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
            />
        </Page.Content>
    );
};
