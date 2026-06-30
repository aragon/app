import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { IMemberProfileTextRecord } from '../../domain/IMemberProfileTextRecord';
import type { IGetEnsTextRecordsParams } from '../../memberProfileService.api';
import { memberProfileServiceClient } from '../../memberProfileService.client';
import { memberProfileServiceKeys } from '../../memberProfileServiceKeys';

export const memberProfileTextRecordsOptions = (
    params: IGetEnsTextRecordsParams,
    options?: QueryOptions<IMemberProfileTextRecord[]>,
): SharedQueryOptions<IMemberProfileTextRecord[]> => ({
    queryKey: memberProfileServiceKeys.textRecords(params),
    queryFn: () => memberProfileServiceClient.getEnsTextRecords(params),
    ...options,
});

export const useMemberProfileTextRecords = (
    params: IGetEnsTextRecordsParams,
    options?: QueryOptions<IMemberProfileTextRecord[]>,
) => useQuery(memberProfileTextRecordsOptions(params, options));
