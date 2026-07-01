import type { GetMemberProfileTextRecordsRequestDTO } from '@aragon/aragon-domain';
import type { IRequestUrlParams } from '@/shared/api/httpService';

export interface IGetEnsTextRecordsParams
    extends IRequestUrlParams<GetMemberProfileTextRecordsRequestDTO> {}
