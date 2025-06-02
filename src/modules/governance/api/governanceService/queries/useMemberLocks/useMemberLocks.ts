import { type IPaginatedResponse } from '@/shared/api/aragonBackendService'
import type {
  InfiniteQueryOptions,
  SharedInfiniteQueryOptions,
} from '@/shared/types'
import { useInfiniteQuery } from '@tanstack/react-query'
import type { IMemberLock } from '../../domain'
import { governanceService } from '../../governanceService'
import type { IGetMemberLocksParams } from '../../governanceService.api'
import { governanceServiceKeys } from '../../governanceServiceKeys'

export const memberLocksOptions = <
  TLock extends IMemberLock = IMemberLock
>(
  params: IGetMemberLocksParams,
  options?: InfiniteQueryOptions<IPaginatedResponse<TLock>, IGetMemberLocksParams>
): SharedInfiniteQueryOptions<
  IPaginatedResponse<TLock>,
  IGetMemberLocksParams
> => ({
  queryKey: governanceServiceKeys.memberLocks(params),
  initialPageParam: params,
  queryFn: ({ pageParam }) => governanceService.getMemberLocks(pageParam),
  getNextPageParam: governanceService.getNextPageParams,
  ...options,
})

export const useMemberLocks = <
  TLock extends IMemberLock = IMemberLock
>(
  params: IGetMemberLocksParams,
  options?: InfiniteQueryOptions<IPaginatedResponse<TLock>, IGetMemberLocksParams>
) => {
  return useInfiniteQuery(memberLocksOptions(params, options))
}
