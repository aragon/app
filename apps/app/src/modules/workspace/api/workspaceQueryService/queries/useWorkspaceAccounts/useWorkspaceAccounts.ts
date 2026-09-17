import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { IWorkspaceAccountInfo } from '../../domain';
import { workspaceQueryService } from '../../workspaceQueryService';
import type { IGetWorkspaceAccountsParams } from '../../workspaceQueryService.api';
import { workspaceQueryServiceKeys } from '../../workspaceQueryServiceKeys';

/**
 * Resolving an address that is not an indexed DAO costs one upstream Safe call, so the result is kept fresh for
 * five minutes to avoid re-resolving the same account while the user edits the form.
 */
const accountsStaleTime = 5 * 60 * 1000;

export const workspaceAccountsOptions = (
    params: IGetWorkspaceAccountsParams,
    options?: QueryOptions<IWorkspaceAccountInfo[]>,
): SharedQueryOptions<IWorkspaceAccountInfo[]> => ({
    queryKey: workspaceQueryServiceKeys.accounts(params),
    queryFn: () => workspaceQueryService.getAccounts(params),
    staleTime: accountsStaleTime,
    ...options,
});

export const useWorkspaceAccounts = (
    params: IGetWorkspaceAccountsParams,
    options?: QueryOptions<IWorkspaceAccountInfo[]>,
) => useQuery(workspaceAccountsOptions(params, options));
