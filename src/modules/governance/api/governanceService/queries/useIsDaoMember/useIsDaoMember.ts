import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import { governanceService } from '../../governanceService';
import { type IGetIsDaoMemberParams } from '../../governanceService.api';
import { governanceServiceKeys } from '../../governanceServiceKeys';

export const isDaoMemberOptions = (
    params: IGetIsDaoMemberParams,
    options?: QueryOptions<boolean>,
): SharedQueryOptions<boolean> => ({
    queryKey: governanceServiceKeys.isDaoMember(params),
    queryFn: () => governanceService.getIsDaoMember(params),
    ...options,
});

export const useIsDaoMember = (params: IGetIsDaoMemberParams, options?: QueryOptions<boolean>) => {
    return useQuery(isDaoMemberOptions(params, options));
};
