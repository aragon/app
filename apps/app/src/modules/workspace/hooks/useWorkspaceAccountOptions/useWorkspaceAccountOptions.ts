import { addressUtils } from '@aragon/gov-ui-kit';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceAccountPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { useWorkspaceAccounts } from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    useWorkspace,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import { WorkspaceAccountState } from '../../constants/workspaceAccountState';
import {
    workspaceAllAccountsSegment,
    workspaceUtils,
} from '../../utils/workspaceUtils';

export interface IWorkspaceAccountOption {
    /**
     * ID of the option, which is the account ID, or `workspaceAllAccountsSegment` for the aggregated one. It is
     * also the account segment of the URL the option leads to.
     */
    id: string;
    /**
     * Label of the option.
     */
    label: string;
    /**
     * Account of the option, undefined for the aggregated one.
     */
    account?: IWorkspaceAccount;
    /**
     * Whether this is the option aggregating every account of the workspace.
     */
    isAllAccounts: boolean;
    /**
     * Whether the account is named by the URL only, i.e. not held by the workspace. Its `account` is synthesized
     * from the accounts API and stays undefined until the API resolves the address to a DAO or a Safe.
     */
    isExternal: boolean;
    /**
     * What the accounts API says an external account is (`workspaceUtils.resolveAccountState`), undefined while the
     * lookup is pending, when it placed nothing, and for every other option.
     */
    accountState?: WorkspaceAccountState;
}

export interface IUseWorkspaceAccountOptionsResult {
    /**
     * Accounts the reader can switch to, the aggregated one first.
     */
    options: IWorkspaceAccountOption[];
    /**
     * Account segment of the current URL — an account ID, or `workspaceAllAccountsSegment`.
     */
    accountId: string;
    /**
     * Option the URL names: the aggregated one, an account of the workspace, or an external option for an account
     * the workspace does not hold. Undefined while the workspace loads and for a segment that is not an account ID.
     */
    activeOption?: IWorkspaceAccountOption;
    /**
     * Whether the URL aggregates every account of the workspace.
     */
    isAllAccounts: boolean;
    /**
     * Accounts the page is scoped to: every account of the workspace on the aggregated scope, otherwise the account
     * of `activeOption`. Empty when that account is not known (yet), never widened to the whole workspace.
     */
    scopedAccounts: IWorkspaceAccount[];
    /**
     * Whether the scope is still being resolved: the workspace is loading, or the accounts API is resolving the
     * external account.
     */
    isPending: boolean;
}

/**
 * Stored type of the account of each state that can be added to a workspace.
 */
const accountStateTypes: Partial<
    Record<WorkspaceAccountState, WorkspaceAccountType>
> = {
    [WorkspaceAccountState.DAO]: WorkspaceAccountType.DAO,
    [WorkspaceAccountState.SAFE]: WorkspaceAccountType.SAFE,
};

/**
 * Accounts of the workspace the reader can switch to, plus the account the URL is scoped to.
 *
 * The account is read from the route rather than from a query parameter or from state, so there is nothing to keep
 * in sync: the URL is the selection. That is a hook and not a context because both reads below go through React
 * Query, whose cache already shares them across every component on the page.
 *
 * Every account of the workspace becomes an option, DAO and Safe alike, so a Safe can be scoped to like a DAO.
 *
 * The URL can name an account the workspace does not hold, e.g. after opening a shared link in another workspace.
 * That account becomes an **external** option rather than an undefined `activeOption`, which every page would read as
 * the aggregated scope: its type and name come from the accounts API (the same single-account query
 * `WorkspaceGateAccountPrompt` reads, so it is usually cached), and its `account` is only set once the type is known,
 * as every consumer branches on it. Pages read `scopedAccounts` instead of re-deriving the selection, so an external
 * account that is pending or unresolvable narrows the page to nothing rather than widening it to every account.
 *
 * `accountId` and `activeOption` are not interchangeable. `accountId` is the raw route segment, read only to build
 * links (`NavigationWorkspace`). `activeOption` is the resolved account, handed to the selector and the aside cards,
 * while pages narrow their requests by `scopedAccounts`. No page resolves the segment again: two resolvers drift.
 *
 * The account segment is resolved through `workspaceUtils.findAccountById` rather than by comparing ID strings:
 * stored IDs are checksummed by `buildAccountId` while `LayoutWorkspaceAccount` accepts any casing.
 */
export const useWorkspaceAccountOptions =
    (): IUseWorkspaceAccountOptionsResult => {
        const { t } = useTranslations();

        // `accountId` is absent on the routes that are not account-scoped, which read as the aggregated segment.
        const { workspaceId, accountId = workspaceAllAccountsSegment } =
            useParams<Partial<IWorkspaceAccountPageParams>>();

        const { data: workspace, isPending: isWorkspacePending } = useWorkspace(
            { urlParams: { id: workspaceId ?? '' } },
            { enabled: workspaceId != null },
        );

        const accounts = workspace?.accounts;
        const accountRefs = useMemo(
            () =>
                (accounts ?? []).map(({ network, address }) => ({
                    network,
                    address,
                })),
            [accounts],
        );
        const { data: accountInfos } = useWorkspaceAccounts(
            { body: { accounts: accountRefs } },
            { enabled: accountRefs.length > 0 },
        );

        const isAllAccounts = accountId === workspaceAllAccountsSegment;

        const activeAccount = workspaceUtils.findAccountById(
            accounts ?? [],
            accountId,
        );

        // A valid account ID the loaded workspace does not hold.
        const isExternal =
            accounts != null &&
            activeAccount == null &&
            workspaceUtils.resolveAccountScope(accountId) === accountId &&
            !isAllAccounts;

        const externalRef = useMemo(
            () => (isExternal ? daoUtils.parseDaoId(accountId) : undefined),
            [isExternal, accountId],
        );
        const {
            data: externalInfos,
            error: externalInfosError,
            isPending: isExternalInfosPending,
        } = useWorkspaceAccounts(
            {
                body: {
                    accounts: externalRef != null ? [externalRef] : [],
                },
            },
            { enabled: externalRef != null },
        );

        const options = useMemo<IWorkspaceAccountOption[]>(() => {
            const accountOptions = (accounts ?? []).map((account) => ({
                id: account.id,
                // Same precedence as the workspace overview rows, so an option and its row never disagree.
                label: workspaceUtils.getAccountLabel(
                    account,
                    workspaceUtils.findAccountInfo(accountInfos, account),
                ),
                account,
                isAllAccounts: false,
                isExternal: false,
            }));

            const allAccountsOption = {
                id: workspaceAllAccountsSegment,
                label: t(
                    'app.workspace.useWorkspaceAccountOptions.allAccounts',
                ),
                isAllAccounts: true,
                isExternal: false,
            };

            if (externalRef == null) {
                return [allAccountsOption, ...accountOptions];
            }

            // The lookup names a single account, so its only entry is that account.
            const externalInfo = externalInfos?.[0];

            // The same rule as `WorkspaceAccountGate`, so the server and the client agree on what the account is.
            const accountState = workspaceUtils.resolveAccountState(
                externalInfo,
                externalInfosError,
            );
            const externalType =
                accountState != null
                    ? accountStateTypes[accountState]
                    : undefined;
            const externalAccount: IWorkspaceAccount | undefined =
                externalInfo != null && externalType != null
                    ? {
                          id: workspaceUtils.buildAccountId(externalInfo),
                          type: externalType,
                          network: externalInfo.network,
                          address: externalInfo.address,
                      }
                    : undefined;

            const externalOption = {
                // The route segment as is, so the option links to the page being looked at.
                id: accountId,
                label:
                    externalInfo?.name ??
                    addressUtils.truncateAddress(externalRef.address),
                account: externalAccount,
                isAllAccounts: false,
                isExternal: true,
                accountState,
            };

            return [allAccountsOption, ...accountOptions, externalOption];
        }, [
            accounts,
            accountInfos,
            accountId,
            externalRef,
            externalInfos,
            externalInfosError,
            t,
        ]);

        const activeOptionId = activeAccount?.id ?? accountId;
        const activeOption = options.find(
            (option) => option.id === activeOptionId,
        );

        const scopedAccounts = isAllAccounts
            ? (accounts ?? [])
            : activeOption?.account != null
              ? [activeOption.account]
              : [];

        const isPending =
            isWorkspacePending || (isExternal && isExternalInfosPending);

        return {
            options,
            accountId,
            activeOption,
            isAllAccounts,
            scopedAccounts,
            isPending,
        };
    };
