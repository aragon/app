import type { MemberProfileTextRecordDTO } from '@aragon/aragon-domain';
import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { IGetEnsTextRecordsParams } from '../../memberProfileService.api';
import { memberProfileServiceClient } from '../../memberProfileService.client';
import { memberProfileServiceKeys } from '../../memberProfileServiceKeys';

export const memberProfileTextRecordsOptions = (
    params: IGetEnsTextRecordsParams,
    options?: QueryOptions<MemberProfileTextRecordDTO[]>,
): SharedQueryOptions<MemberProfileTextRecordDTO[]> => ({
    queryKey: memberProfileServiceKeys.textRecords(params),
    queryFn: () => memberProfileServiceClient.getEnsTextRecords(params),
    ...options,
});

export const useMemberProfileTextRecords = (
    params: IGetEnsTextRecordsParams,
    options?: QueryOptions<MemberProfileTextRecordDTO[]>,
) => useQuery(memberProfileTextRecordsOptions(params, options));
