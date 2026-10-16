import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceAccountPageParams } from '@/shared/types';
import { useWorkspaceAccounts } from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    useWorkspace,
} from '../../api/workspaceService';
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
     * Option the URL names, undefined when the workspace holds no account with that ID.
     */
    activeOption?: IWorkspaceAccountOption;
    /**
     * Whether the URL aggregates every account of the workspace.
     */
    isAllAccounts: boolean;
}

/**
 * Accounts of the workspace the reader can switch to, plus the account the URL is scoped to.
 *
 * The account is read from the route rather than from a query parameter or from state, so there is nothing to keep
 * in sync: the URL is the selection. That is a hook and not a context because both reads below go through React
 * Query, whose cache already shares them across every component on the page.
 *
 * Every account of the workspace becomes an option, DAO and Safe alike, so a Safe can be scoped to like a DAO.
 *
 * `activeOption` is the aggregated option for the aggregated segment, and is deliberately allowed to be undefined
 * while `accountId` is set: the URL can name an account the workspace does not hold, and what is being *looked at*
 * is not the same question as what can be *switched to*.
 *
 * The two are not interchangeable. `accountId` is the raw route segment and is what a link is built from, which is
 * all `NavigationWorkspace` and this hook's own option URLs use it for. `activeOption` is the resolved account, and
 * is what a page narrows its request to or hands to an aside card. Resolving the segment a second time inside a
 * page is the thing this hook exists to prevent: two resolvers drift, and the selector's trigger label and its
 * checkmark disagreed on a lowercased URL until the last of them was removed.
 *
 * The account segment is resolved through `workspaceUtils.findAccountById` rather than by comparing ID strings:
 * stored IDs are checksummed by `buildAccountId` while `LayoutWorkspaceAccount` accepts any casing, so a lowercased
 * URL must still land on the same account instead of silently widening to the whole workspace.
 */
export const useWorkspaceAccountOptions =
    (): IUseWorkspaceAccountOptionsResult => {
        const { t } = useTranslations();

        // Both are route parameters, so no path parsing is needed. `accountId` is absent on the routes that are not
        // account-scoped, which read as the aggregated segment.
        const { workspaceId, accountId = workspaceAllAccountsSegment } =
            useParams<Partial<IWorkspaceAccountPageParams>>();

        const { data: workspace } = useWorkspace(
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
            }));

            return [
                {
                    id: workspaceAllAccountsSegment,
                    label: t(
                        'app.workspace.useWorkspaceAccountOptions.allAccounts',
                    ),
                    isAllAccounts: true,
                },
                ...accountOptions,
            ];
        }, [accounts, accountInfos, t]);

        const activeAccount = workspaceUtils.findAccountById(
            accounts ?? [],
            accountId,
        );

        const activeOption = isAllAccounts
            ? options.find((option) => option.isAllAccounts)
            : activeAccount != null
              ? options.find(
                    (option) => option.account?.id === activeAccount.id,
                )
              : undefined;

        return {
            options,
            accountId,
            activeOption,
            isAllAccounts,
        };
    };
