import 'server-only';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { IMemberProfileTextRecord } from '../../domain/IMemberProfileTextRecord';
import type { IGetEnsTextRecordsParams } from '../../memberProfileService.api';
import { memberProfileServiceServer } from '../../memberProfileService.server';
import { memberProfileTextRecordsOptions } from './useMemberProfileTextRecords';

/**
 * It shares the query key with the client `useMemberProfileTextRecords` hook,
 * so the dehydrated cache from resolves the client query without a second network call.
 *
 * @example
 * await queryClient.prefetchQuery(
 *     memberProfileTextRecordsOptionsServer({ urlParams: { name } }),
 *  );
 */
export const memberProfileTextRecordsOptionsServer = (
    params: IGetEnsTextRecordsParams,
    options?: QueryOptions<IMemberProfileTextRecord[]>,
): SharedQueryOptions<IMemberProfileTextRecord[]> => ({
    ...memberProfileTextRecordsOptions(params, options),
    queryFn: () => memberProfileServiceServer.getEnsTextRecords(params),
});
