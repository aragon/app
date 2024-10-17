import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import { governanceService } from '../../governanceService';
import { type IGetMemberExistsParams } from '../../governanceService.api';
import { governanceServiceKeys } from '../../governanceServiceKeys';

export const memberExistsOptions = (
    params: IGetMemberExistsParams,
    options?: QueryOptions<boolean>,
): SharedQueryOptions<boolean> => ({
    queryKey: governanceServiceKeys.memberExists(params),
    queryFn: () => governanceService.getMemberExists(params),
    ...options,
});

export const useMemberExists = (params: IGetMemberExistsParams, options?: QueryOptions<boolean>) => {
    return useQuery(memberExistsOptions(params, options));
};
