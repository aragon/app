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
import { daoProposalListFilterParam } from '@/modules/governance/components/daoProposalList';
import { voteListFilterParam } from '@/modules/governance/components/voteList';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { daoUtils } from '@/shared/utils/daoUtils';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import {
    type IGetWorkspaceMemberListParams,
    type IWorkspaceMember,
    type IWorkspaceMemberListFilters,
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
 * request as long as they build the very same body, since that is what the query key is made of. The `filters` key
 * is therefore only set when filters are passed.
 * @param accounts - Accounts to aggregate the members of.
 * @param pageSize - Number of members to read per page.
 * @param filters - Filters narrowing the members inside the accounts.
 * @returns The parameters of the workspace member list request.
 */
export const buildWorkspaceMemberListParams = (
    accounts: IWorkspaceAccount[],
    pageSize: number,
    filters?: IWorkspaceMemberListFilters,
): IGetWorkspaceMemberListParams => ({
    body: {
        accounts: accounts.map(({ network, address }) => ({
            network,
            address,
        })),
        ...(filters != null && { filters }),
        pagination: { pageSize },
    },
});

/**
 * Visible governance plugins of one account, as the rows need them: the bodies to pick a membership from, and the
 * processes to name the one the chosen body acts through.
 */
export interface IWorkspaceAccountPlugins {
    /**
     * Bodies of the account, sub-plugins included.
     */
    bodies: IDaoPlugin[];
    /**
     * Processes of the account, sub-plugins excluded, matching the set the member page filters its proposals by.
     *
     * Unset while they are still being read. A row must be able to tell that from an account that has none, the
     * same distinction the map itself draws for the bodies: an empty list means the body is in no process and the
     * link says nothing about proposals, whereas an unresolved one would be a process the row simply cannot name
     * yet.
     */
    processes?: IDaoPlugin[];
}

/**
 * The membership a row links to: the account whose member page serves it and, when the plugins of that account are
 * known, the identifiers of the body the membership is held on and of the process that body acts through.
 */
interface IWorkspaceMemberTarget {
    accountId: string;
    bodyAddress: string;
    bodyId?: string;
    processId?: string;
}

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
     * ID of the account whose member page the row links to, undefined when the member holds no membership on an
     * account of the workspace that has one.
     */
    accountId?: string;
    /**
     * Filter identifier of the governance body of the membership the row links to, so the member page reports the
     * body the row stands for rather than resolving one of its own.
     */
    bodyId?: string;
    /**
     * Filter identifier of the process the body acts through, so the proposals of the member page open on the same
     * governance the row stands for instead of on every process of the account.
     */
    processId?: string;
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
    const { member, workspaceId, accountId, bodyId, processId } = props;

    // Resolved exactly as `DaoMemberListDefault` does — including the stripped Aragon registry suffix — so a member
    // reads the same here and on the account members page this row links to.
    const { data: ensName } = useEnsName(member.address);
    const { data: ensAvatar } = useEnsAvatar(ensName);
    const { data: displayName } = useEnsName(member.address, {
        stripAragonRegistrySuffix: true,
    });

    const { buildEntityUrl } = useDaoChain({ network: member.network });

    /**
     * URL of the member page of the member on the given account.
     *
     * The workspace address is checksummed because the DAO member page redirects any other casing to the `/dao/…`
     * route, which would leave the workspace.
     *
     * The governance travels on the parameters the member page already carries — the ones its vote list and its
     * proposal list write — rather than on any of its own: membership is body-scoped, so naming the body picks
     * both the body the page reports and the body its voting activity opens on, and naming the process the body
     * acts through opens its proposals on the same governance. A row that could not name one leaves that parameter
     * off, and the page resolves it as it did before.
     */
    const getMemberPageUrl = (accountId: string) => {
        const url = workspaceUtils.getAccountScopeUrl(
            workspaceId,
            accountId,
            `members/${addressUtils.getChecksum(member.address)}`,
        );

        const query = new URLSearchParams();

        if (bodyId != null) {
            query.set(voteListFilterParam, bodyId);
        }

        if (processId != null) {
            query.set(daoProposalListFilterParam, processId);
        }

        const queryString = query.toString();

        return queryString === '' ? url : `${url}?${queryString}`;
    };

    const memberPageUrl =
        accountId == null ? undefined : getMemberPageUrl(accountId);

    const isExternalLink = memberPageUrl == null;

    const href =
        memberPageUrl ??
        buildEntityUrl({ type: ChainEntityType.ADDRESS, id: member.address });

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

export interface IWorkspaceMemberListDefaultProps {
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
    /**
     * Filters narrowing the members inside the accounts.
     */
    filters?: IWorkspaceMemberListFilters;
    /**
     * Visible governance plugins of every account keyed by account ID.
     */
    visiblePluginsByAccountId?: Record<string, IWorkspaceAccountPlugins>;
}

/**
 * Members of every account of a workspace, laid out like `DaoMemberListDefault` of the DAO pages.
 *
 * The endpoint merges an address into a single entry carrying one membership per account and body, so each row
 * links to the first of those memberships the workspace serves a page for: there is no aggregated member page, the
 * member details live under a single account and a single body.
 */
export const WorkspaceMemberListDefault: React.FC<
    IWorkspaceMemberListDefaultProps
> = (props) => {
    const {
        workspaceId,
        accounts,
        pageSize,
        filters,
        visiblePluginsByAccountId,
    } = props;

    const { t } = useTranslations();

    const hasAccounts = accounts.length > 0;

    const { data, status, fetchStatus, isFetchingNextPage, fetchNextPage } =
        useWorkspaceMemberList(
            buildWorkspaceMemberListParams(accounts, pageSize, filters),
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

    const getMemberTarget = (
        member: IWorkspaceMember,
    ): IWorkspaceMemberTarget | undefined => {
        const targets = member.memberships.flatMap<IWorkspaceMemberTarget>(
            (membership) => {
                const accountId = workspaceUtils.buildAccountId(
                    membership.account,
                );
                const bodyAddress = membership.governance.address;

                if (!memberPageAccountIds.has(accountId)) {
                    return [];
                }

                const visiblePlugins = visiblePluginsByAccountId?.[accountId];

                // The plugins of the account are not known — the DAO read failed, or has not resolved yet.
                // The membership is kept and linked without naming a governance.
                if (visiblePlugins == null) {
                    return [{ accountId, bodyAddress }];
                }

                const body = visiblePlugins.bodies.find((plugin) =>
                    addressUtils.isAddressEqual(plugin.address, bodyAddress),
                );

                // The body is hidden (through the CMS overrides).
                // Member should not be linked to the Member Details page for the account.
                if (body == null) {
                    return [];
                }

                // The process the body acts through, so the proposals of the member page open on the same
                // governance.
                const process =
                    visiblePlugins.processes == null
                        ? undefined
                        : daoUtils.findPluginProcess(
                              body,
                              visiblePlugins.processes,
                          );

                const processId =
                    process == null
                        ? undefined
                        : daoUtils.buildPluginUniqueId(process);

                const bodyId = daoUtils.buildPluginUniqueId(body);

                return [
                    {
                        accountId,
                        bodyAddress,
                        bodyId,
                        processId,
                    },
                ];
            },
        );

        const filteredBody = filters?.governanceAddress;

        const filteredTarget =
            filteredBody != null
                ? targets.find(({ bodyAddress }) =>
                      addressUtils.isAddressEqual(bodyAddress, filteredBody),
                  )
                : undefined;

        return filteredTarget ?? targets[0];
    };

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
                {members?.map((member) => {
                    const target = getMemberTarget(member);

                    return (
                        <WorkspaceMemberListItem
                            accountId={target?.accountId}
                            bodyId={target?.bodyId}
                            key={`${member.network}-${member.address}`}
                            member={member}
                            processId={target?.processId}
                            workspaceId={workspaceId}
                        />
                    );
                })}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};
