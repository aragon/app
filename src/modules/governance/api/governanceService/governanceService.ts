import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IMember } from './domain';
import type { IGetMemberListParams } from './governanceService.api';

class GovernanceService extends AragonBackendService {
    private urls = {
        members: '/members/active',
    };

    getMemberList = async <TMember extends IMember = IMember>(
        params: IGetMemberListParams,
    ): Promise<IPaginatedResponse<TMember>> => {
        const result = await this.request<IPaginatedResponse<TMember>>(this.urls.members, params);

        return result;
    };
}

export const governanceService = new GovernanceService();
