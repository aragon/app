'use client';

import {
    AlertInline,
    addressUtils,
    ChainEntityType,
    DataListContainer,
    DataListPagination,
    DataListRoot,
    MemberDataListItem,
} from '@aragon/gov-ui-kit';
import { useEnsAvatar, useEnsName } from '@/modules/ens';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import {
    type IGetWorkspaceMemberListParams,
    type IWorkspaceMember,
    useWorkspaceMemberList,
} from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import { workspaceUtils } from '../../utils/workspaceUtils';

/**
 * Builds the parameters of the aggregated member list request.
 *
 * Shared with the aside card, which reads the totals out of the same response: the two only stay on a single
 * request as long as they build the very same body, since that is what the query key is made of.
 * @param accounts - Accounts to aggregate the members of.
 * @param pageSize - Number of members to read per page.
 * @returns The parameters of the workspace member list request.
 */
export const buildWorkspaceMemberListParams = (
    accounts: IWorkspaceAccount[],
    pageSize: number,
): IGetWorkspaceMemberListParams => ({
    body: {
        accounts: accounts.map(({ network, address }) => ({
            network,
            address,
        })),
        pagination: { pageSize },
    },
});

interface IWorkspaceMemberListItemProps {
    /**
     * Member the row stands for.
     */
    member: IWorkspaceMember;
    /**
     * ID of the workspace the row links into.
     */
    workspaceId: string;
    /**
     * ID of the account whose member page the row links to, undefined when the member holds no membership on a DAO
     * account of the workspace.
     */
    accountId?: string;
}

/**
 * One row of the list.
 *
 * A component of its own because it resolves ENS per member and React hooks cannot be called inside a `.map()`
 * callback. With `batch.multicall` enabled on the viem client, the ENS reads across the rendered rows are
 * auto-batched into RPC multicalls, as they are on `DaoMemberListDefault`.
 */
const WorkspaceMemberListItem: React.FC<IWorkspaceMemberListItemProps> = (
    props,
) => {
    const { member, workspaceId, accountId } = props;

    // Resolved exactly as `DaoMemberListDefault` does — including the stripped Aragon registry suffix — so a member
    // reads the same here and on the account members page this row links to.
    const { data: ensName } = useEnsName(member.address);
    const { data: ensAvatar } = useEnsAvatar(ensName);
    const { data: displayName } = useEnsName(member.address, {
        stripAragonRegistrySuffix: true,
    });

    const { buildEntityUrl } = useDaoChain({ network: member.network });

    // A member of no account that serves a member page — a Safe owner, today — has nowhere to go inside the
    // workspace, and linking to its Safe would render `WorkspaceAccountGate`'s error state, so the row points at the
    // address on the block explorer instead.
    const isExternalLink = accountId == null;

    // The workspace address is checksummed because the DAO member page redirects any other casing to the `/dao/…`
    // route, which would leave the workspace.
    const href = isExternalLink
        ? buildEntityUrl({ type: ChainEntityType.ADDRESS, id: member.address })
        : workspaceUtils.getAccountScopeUrl(
              workspaceId,
              accountId,
              `members/${addressUtils.getChecksum(member.address)}`,
          );

    return (
        <MemberDataListItem.Structure
            address={member.address}
            avatarSrc={ensAvatar ?? undefined}
            className="min-w-0"
            ensName={displayName ?? undefined}
            href={href}
            rel={isExternalLink ? 'noopener noreferrer' : undefined}
            target={isExternalLink ? '_blank' : undefined}
        />
    );
};

export interface IWorkspaceMemberListProps {
    /**
     * ID of the workspace, used to link each member to the members page of its account.
     */
    workspaceId: string;
    /**
     * Accounts to aggregate the members of, DAOs and Safes alike.
     */
    accounts: IWorkspaceAccount[];
    /**
     * Number of members to read per page.
     */
    pageSize: number;
}

/**
 * Members of every account of a workspace, laid out like `DaoMemberListDefault` of the DAO pages.
 *
 * The endpoint merges an address into a single entry carrying one membership per account, so each row links to the
 * member page of the first DAO account it belongs to: there is no aggregated member page, the member details live
 * under a single account.
 */
export const WorkspaceMemberList: React.FC<IWorkspaceMemberListProps> = (
    props,
) => {
    const { workspaceId, accounts, pageSize } = props;

    const { t } = useTranslations();

    const hasAccounts = accounts.length > 0;

    const { data, status, fetchStatus, isFetchingNextPage, fetchNextPage } =
        useWorkspaceMemberList(
            buildWorkspaceMemberListParams(accounts, pageSize),
            { enabled: hasAccounts },
        );

    const members = data?.pages.flatMap((page) => page.data);
    const metadata = data?.pages[0]?.metadata;

    // The list is incomplete as soon as one account of one loaded page could not be read in full. Saying so is what
    // stops a short list from reading as the complete membership.
    const isPartial = data?.pages.some((page) => page.partial) ?? false;

    // A workspace with no account keeps the query disabled, which would otherwise leave the list loading forever
    // instead of showing its empty state.
    const state = hasAccounts
        ? dataListUtils.queryToDataListState({
              status,
              fetchStatus,
              isFetchingNextPage,
          })
        : 'idle';

    // Accounts whose member page the app can serve. Membership is not a DAO notion — a Safe owner is a member of
    // the workspace too — but the account-scoped member route resolves an account by reading its DAO, so only DAO
    // accounts have a page to open today. This set is what grows when Safe account pages land; see the TODO on
    // `WorkspaceAccountGate`.
    const memberPageAccountIds = new Set(
        accounts
            .filter((account) => account.type === WorkspaceAccountType.DAO)
            .map((account) => account.id),
    );

    /**
     * The account whose member page the member is linked to: the first of its memberships held on an account that
     * has one. The endpoint orders the memberships, so this is stable for a given member.
     */
    const getMemberAccountId = (member: IWorkspaceMember): string | undefined =>
        member.memberships
            .map((membership) =>
                workspaceUtils.buildAccountId(membership.account),
            )
            .find((accountId) => memberPageAccountIds.has(accountId));

    return (
        <DataListRoot
            entityLabel={t('app.workspace.workspaceMemberList.entity')}
            itemsCount={metadata?.totalRecords}
            onLoadMore={fetchNextPage}
            pageSize={pageSize}
            state={state}
        >
            {isPartial && (
                <AlertInline
                    message={t('app.workspace.workspaceMemberList.partial')}
                    variant="warning"
                />
            )}
            <DataListContainer
                emptyState={{
                    heading: t(
                        'app.workspace.workspaceMemberList.emptyState.heading',
                    ),
                    description: t(
                        'app.workspace.workspaceMemberList.emptyState.description',
                    ),
                }}
                errorState={{
                    heading: t(
                        'app.workspace.workspaceMemberList.errorState.heading',
                    ),
                    description: t(
                        'app.workspace.workspaceMemberList.errorState.description',
                    ),
                }}
                layoutClassName="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                SkeletonElement={MemberDataListItem.Skeleton}
            >
                {members?.map((member) => (
                    <WorkspaceMemberListItem
                        accountId={getMemberAccountId(member)}
                        key={`${member.network}-${member.address}`}
                        member={member}
                        workspaceId={workspaceId}
                    />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};
