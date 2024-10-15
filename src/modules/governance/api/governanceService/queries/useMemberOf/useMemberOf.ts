import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import { governanceService } from '../../governanceService';
import { type IGetMemberOfParams } from '../../governanceService.api';
import { governanceServiceKeys } from '../../governanceServiceKeys';

export const memberOfOptions = <TMemberOf extends boolean = boolean>(
    params: IGetMemberOfParams,
    options?: QueryOptions<TMemberOf>,
): SharedQueryOptions<TMemberOf> => ({
    queryKey: governanceServiceKeys.memberOf(params),
    queryFn: () => governanceService.getMemberOf(params),
    ...options,
});

export const useMemberOf = <TMemberOf extends boolean = boolean>(
    params: IGetMemberOfParams,
    options?: QueryOptions<TMemberOf>,
) => {
    return useQuery(memberOfOptions(params, options));
};
