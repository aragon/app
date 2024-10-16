import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import { governanceService } from '../../governanceService';
import { type IGetIsDaoMemberParams } from '../../governanceService.api';
import { governanceServiceKeys } from '../../governanceServiceKeys';

export const isDaoMemberOfOptions = (
    params: IGetIsDaoMemberParams,
    options?: QueryOptions<boolean>,
): SharedQueryOptions<boolean> => ({
    queryKey: governanceServiceKeys.memberOf(params),
    queryFn: () => governanceService.getIsDaoMember(params),
    ...options,
});

export const useIsDaoMemberOf = (params: IGetIsDaoMemberParams, options?: QueryOptions<boolean>) => {
    return useQuery(isDaoMemberOfOptions(params, options));
};
