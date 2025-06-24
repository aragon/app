import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import { governanceService } from '../../governanceService';
import { type IGetMemberExistsParams } from '../../governanceService.api';
import { governanceServiceKeys } from '../../governanceServiceKeys';
import type { IMemberExistsResult } from './../../../../types';

export const memberExistsOptions = (
    params: IGetMemberExistsParams,
    options?: QueryOptions<IMemberExistsResult>,
): SharedQueryOptions<IMemberExistsResult> => ({
    queryKey: governanceServiceKeys.memberExists(params),
    queryFn: () => governanceService.getMemberExists(params),
    ...options,
});

export const useMemberExists = (params: IGetMemberExistsParams, options?: QueryOptions<IMemberExistsResult>) => {
    return useQuery(memberExistsOptions(params, options));
};
