import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceAccountPageParams } from '@/shared/types';
import { useWorkspaceAccounts } from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    useWorkspace,
    WorkspaceAccountType,
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
 * `activeOption` is deliberately allowed to be undefined while `accountId` is set: the URL can name an account the
 * workspace does not hold, and what is being *looked at* is not the same question as what can be *switched to*.
 * Callers that need to render the account itself should use `accountId`, not `activeOption`.
 *
 * Only DAO accounts become options. The aggregated option still covers every account, so a Safe's balances are
 * visible there, but a Safe has no option of its own.
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

        const options = useMemo<IWorkspaceAccountOption[]>(() => {
            const accountOptions = (accounts ?? [])
                .filter((account) => account.type === WorkspaceAccountType.DAO)
                .map((account) => ({
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

        return {
            options,
            accountId,
            activeOption: options.find((option) => option.id === accountId),
            isAllAccounts: accountId === workspaceAllAccountsSegment,
        };
    };
