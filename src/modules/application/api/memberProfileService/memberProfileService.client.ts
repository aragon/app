import { AragonSubdomainServiceClient } from '@/shared/api/aragonSubdomainService';
import type { IMemberProfileTextRecord } from './domain/IMemberProfileTextRecord';
import type { IGetEnsTextRecordsParams } from './memberProfileService.api';

class MemberProfileServiceClient extends AragonSubdomainServiceClient {
    private urls = {
        getMemberProfileTextRecords: '/member-profile/:name/records',
    };

    getEnsTextRecords = async (params: IGetEnsTextRecordsParams) => {
        const result = await this.request<IMemberProfileTextRecord[]>(
            this.urls.getMemberProfileTextRecords,
            params,
        );

        return result;
    };
}

export const memberProfileServiceClient = new MemberProfileServiceClient();
