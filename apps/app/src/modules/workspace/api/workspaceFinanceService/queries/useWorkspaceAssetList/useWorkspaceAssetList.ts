import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { IWorkspaceAssetListResult } from '../../domain';
import { workspaceFinanceService } from '../../workspaceFinanceService';
import type { IGetWorkspaceAssetListParams } from '../../workspaceFinanceService.api';
import { workspaceFinanceServiceKeys } from '../../workspaceFinanceServiceKeys';

export const workspaceAssetListOptions = (
    params: IGetWorkspaceAssetListParams,
    options?: QueryOptions<IWorkspaceAssetListResult>,
): SharedQueryOptions<IWorkspaceAssetListResult> => ({
    queryKey: workspaceFinanceServiceKeys.assetList(params),
    queryFn: () => workspaceFinanceService.getAssetList(params),
    ...options,
});

export const useWorkspaceAssetList = (
    params: IGetWorkspaceAssetListParams,
    options?: QueryOptions<IWorkspaceAssetListResult>,
) => useQuery(workspaceAssetListOptions(params, options));
