import 'server-only';
import type { MemberProfileTextRecordDTO } from '@aragon/aragon-domain';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { IGetEnsTextRecordsParams } from '../../memberProfileService.api';
import { memberProfileServiceServer } from '../../memberProfileService.server';
import { memberProfileTextRecordsOptions } from './useMemberProfileTextRecords';

/**
 * It shares the query key with the client `useMemberProfileTextRecords` hook,
 * so the dehydrated cache from resolves the client query without a second network call.
 *
 * @example
 * await queryClient.prefetchQuery(
 *     memberProfileTextRecordsOptionsServer({ urlParams: { subdomain } }),
 *  );
 */
export const memberProfileTextRecordsOptionsServer = (
    params: IGetEnsTextRecordsParams,
    options?: QueryOptions<MemberProfileTextRecordDTO[]>,
): SharedQueryOptions<MemberProfileTextRecordDTO[]> => ({
    ...memberProfileTextRecordsOptions(params, options),
    queryFn: () => memberProfileServiceServer.getEnsTextRecords(params),
});
