'use client';

import { addressUtils } from '@aragon/gov-ui-kit';
import { useMemo } from 'react';
import { useFilterUrlParam } from '@/shared/hooks/useFilterUrlParam';
import type { IWorkspaceAccountInfo } from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import { workspaceUtils } from '../../utils/workspaceUtils';

/**
 * URL parameter holding the selected account of a workspace page.
 */
export const workspaceAccountFilterParam = 'account';

/**
 * Value of the filter option aggregating every account of the workspace.
 */
export const workspaceAllAccountsOption = 'all';

export interface IWorkspaceAccountFilterOption {
    /**
     * Identifier of the option, used as the URL parameter value.
     */
    id: string;
    /**
     * Label of the tab.
     */
    label: string;
    /**
     * Account of the option, undefined for the "all accounts" option.
     */
    account?: IWorkspaceAccount;
    /**
     * Whether this is the option aggregating every account of the workspace.
     */
    isAllAccounts: boolean;
}

export interface IUseWorkspaceAccountFilterParams {
    /**
     * Accounts of the workspace.
     */
    accounts?: IWorkspaceAccount[];
    /**
     * Accounts as resolved by the workspace accounts API, used to label the tabs with the indexed DAO names.
     */
    accountInfos?: IWorkspaceAccountInfo[];
    /**
     * Label of the option aggregating every account.
     */
    allAccountsLabel: string;
}

export interface IUseWorkspaceAccountFilterReturn {
    /**
     * Currently selected option.
     */
    activeOption?: IWorkspaceAccountFilterOption;
    /**
     * Selects the given option.
     */
    setActiveOption: (option: IWorkspaceAccountFilterOption) => void;
    /**
     * Every available option, the aggregated one first.
     */
    options: IWorkspaceAccountFilterOption[];
}

/**
 * Builds the account tabs of a workspace page and keeps the selected one on the URL, the way the DAO pages keep
 * their linked-account filter.
 *
 * Only DAO accounts get a tab of their own: a per-account view is served by the single DAO endpoints, which cannot
 * answer for a Safe. Safe accounts still contribute to the aggregated option.
 */
export const useWorkspaceAccountFilter = (
    params: IUseWorkspaceAccountFilterParams,
): IUseWorkspaceAccountFilterReturn => {
    const { accounts, accountInfos, allAccountsLabel } = params;

    const options = useMemo<IWorkspaceAccountFilterOption[]>(() => {
        const accountOptions = (accounts ?? [])
            .filter((account) => account.type === WorkspaceAccountType.DAO)
            .map((account) => {
                const accountInfo = workspaceUtils.findAccountInfo(
                    accountInfos,
                    account,
                );

                return {
                    id: account.id,
                    // Same precedence as the workspace overview rows, so a tab and its row never disagree.
                    label:
                        account.metadata?.name ??
                        accountInfo?.name ??
                        addressUtils.truncateAddress(account.address),
                    account,
                    isAllAccounts: false,
                };
            });

        return [
            {
                id: workspaceAllAccountsOption,
                label: allAccountsLabel,
                isAllAccounts: true,
            },
            ...accountOptions,
        ];
    }, [accounts, accountInfos, allAccountsLabel]);

    const [activeFilter, setActiveFilter] = useFilterUrlParam({
        name: workspaceAccountFilterParam,
        fallbackValue: workspaceAllAccountsOption,
        validValues: options.map((option) => option.id),
    });

    const activeOption = options.find((option) => option.id === activeFilter);

    const setActiveOption = (option: IWorkspaceAccountFilterOption) =>
        setActiveFilter(option.id);

    return { activeOption, setActiveOption, options };
};
