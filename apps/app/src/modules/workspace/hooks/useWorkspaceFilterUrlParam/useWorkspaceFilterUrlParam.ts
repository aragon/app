'use client';

import { useCallback, useMemo } from 'react';
import type { IWorkspaceAccount } from '@/modules/workspace/api/workspaceService';
import type { IDao, ILinkedAccountSummary } from '@/shared/api/daoService';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    type IUseFilterUrlParamParams,
    useFilterUrlParam,
} from '@/shared/hooks/useFilterUrlParam';
import { daoUtils } from '@/shared/utils/daoUtils';
import { useWorkspaceAccountDaos } from '../useWorkspaceAccountDaos';

export interface IWorkspaceFilterOption {
    /**
     * Unique identifier for this option, used as the URL parameter value.
     */
    id: string;
    /**
     * Human-readable label for the option.
     */
    label: string;
    /**
     * Whether this is the workspace-wide "All accounts" option, which aggregates every account of the workspace.
     */
    isAllAccounts: boolean;
    /**
     * Whether this option targets a linked account (child DAO) of one of the workspace accounts.
     */
    isChild: boolean;
    /**
     * Workspace account this option belongs to. Undefined for the "All accounts" option.
     */
    account?: IWorkspaceAccount;
    /**
     * DAO of the workspace account this option belongs to. Undefined for the "All accounts" option.
     */
    dao?: IDao;
    /**
     * Linked account targeted by this option, only set for child options.
     */
    linkedAccount?: ILinkedAccountSummary;
    /**
     * DAO ID to query for this option. Undefined for the "All accounts" option, which fans out one query per account.
     */
    daoId?: string;
    /**
     * When true, the query returns only the account DAO's own data and excludes its linked accounts. Set on account
     * options whose DAO has linked accounts, exactly like the DAO pages do, so the account option and its child
     * options do not overlap.
     */
    onlyParent?: boolean;
}

export interface IUseWorkspaceFilterUrlParamParams
    extends Omit<IUseFilterUrlParamParams, 'validValues'> {
    /**
     * Accounts of the workspace to build the filter options for.
     */
    accounts?: IWorkspaceAccount[];
}

export interface IUseWorkspaceFilterUrlParamReturn {
    /**
     * Currently active filter option.
     */
    activeOption?: IWorkspaceFilterOption;
    /**
     * Sets the active filter option.
     */
    setActiveOption: (option: IWorkspaceFilterOption) => void;
    /**
     * All available filter options, undefined while the account DAOs are loading.
     */
    options?: IWorkspaceFilterOption[];
}

/**
 * Builds the account filter options of a workspace page and syncs the active one with the URL.
 *
 * The option tree is the DAO-page filter lifted one level up: a workspace-wide "All accounts" aggregate, one option
 * per workspace account, and — for accounts whose DAO has linked accounts — one option per linked account. Account
 * options carry `onlyParent` when the DAO has linked accounts so they do not double-count their children, which is
 * the same mechanism `useDaoFilterUrlParam` uses.
 */
export const useWorkspaceFilterUrlParam = (
    params: IUseWorkspaceFilterUrlParamParams,
): IUseWorkspaceFilterUrlParamReturn => {
    const {
        accounts,
        name,
        fallbackValue: fallbackValueProp,
        enableUrlUpdate = true,
    } = params;

    const { t } = useTranslations();
    const { isEnabled } = useFeatureFlags();
    const isLinkedAccountEnabled = isEnabled('linkedAccount');

    const { accountDaos, isLoading } = useWorkspaceAccountDaos({ accounts });

    const options = useMemo<IWorkspaceFilterOption[] | undefined>(() => {
        if (isLoading || accountDaos.length === 0) {
            return;
        }

        const result: IWorkspaceFilterOption[] = [];

        if (accountDaos.length > 1) {
            result.push({
                id: 'all',
                label: t(
                    'app.workspace.workspaceAccountFilter.option.allAccounts',
                ),
                isAllAccounts: true,
                isChild: false,
            });
        }

        accountDaos.forEach(({ account, dao }) => {
            if (dao == null) {
                return;
            }

            const linkedAccounts = isLinkedAccountEnabled
                ? (dao.linkedAccounts ?? [])
                : [];
            const hasLinkedAccounts = linkedAccounts.length > 0;

            result.push({
                id: dao.id,
                label: daoUtils.getDaoDisplayName(dao),
                isAllAccounts: false,
                isChild: false,
                account,
                dao,
                daoId: dao.id,
                onlyParent: hasLinkedAccounts ? true : undefined,
            });

            linkedAccounts.forEach((linkedAccount) => {
                result.push({
                    id: linkedAccount.id,
                    label: daoUtils.getDaoDisplayName(linkedAccount),
                    isAllAccounts: false,
                    isChild: true,
                    account,
                    dao,
                    linkedAccount,
                    daoId: linkedAccount.id,
                });
            });
        });

        return result;
    }, [accountDaos, isLoading, isLinkedAccountEnabled, t]);

    const fallbackValue = fallbackValueProp ?? options?.[0]?.id;
    const validValues = options?.map((option) => option.id);
    const [activeFilter, setActiveFilter] = useFilterUrlParam({
        name,
        fallbackValue,
        enableUrlUpdate,
        validValues,
    });

    const activeOption = useMemo(
        () =>
            options?.find((option) => option.id === activeFilter) ??
            options?.[0],
        [options, activeFilter],
    );

    const setActiveOption = useCallback(
        (option: IWorkspaceFilterOption) => setActiveFilter(option.id),
        [setActiveFilter],
    );

    return { activeOption, setActiveOption, options };
};
