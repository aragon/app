import type { MemberProfileTextRecordDTO } from '@aragon/aragon-domain';
import { AragonDomainServiceClient } from '@/shared/api/aragonDomainService';
import type { IGetEnsTextRecordsParams } from './memberProfileService.api';

class MemberProfileServiceClient extends AragonDomainServiceClient {
    private urls = {
        getMemberProfileTextRecords: '/member-profile/:subdomain/records',
    };

    getEnsTextRecords = async (params: IGetEnsTextRecordsParams) => {
        const result = await this.request<MemberProfileTextRecordDTO[]>(
            this.urls.getMemberProfileTextRecords,
            params,
        );

        return result;
    };
}

export const memberProfileServiceClient = new MemberProfileServiceClient();
