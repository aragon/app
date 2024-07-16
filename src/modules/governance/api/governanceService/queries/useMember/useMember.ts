import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import { type IMember } from '../../domain';
import { governanceService } from '../../governanceService';
import { type IGetMemberParams } from '../../governanceService.api';
import { governanceServiceKeys } from '../../governanceServiceKeys';

export const memberOptions = <TMember extends IMember = IMember>(
    params: IGetMemberParams,
    options?: QueryOptions<TMember>,
): SharedQueryOptions<TMember> => ({
    queryKey: governanceServiceKeys.member(params),
    queryFn: () => governanceService.getMember(params),
    ...options,
});

export const useMember = <TMember extends IMember = IMember>(
    params: IGetMemberParams,
    options?: QueryOptions<TMember>,
) => {
    return useQuery(memberOptions(params, options));
};
