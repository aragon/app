import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IMember } from './domain';
import type { IGetMemberListParams } from './governanceService.api';
import { membersMock } from './governanceServiceMocks';

class GovernanceService extends AragonBackendService {
    private mock = true;

    private urls = {
        members: '/members',
    };

    getMemberList = async <TMember extends IMember = IMember>(
        params: IGetMemberListParams,
    ): Promise<IPaginatedResponse<TMember>> => {
        if (this.mock) {
            return membersMock as IPaginatedResponse<TMember>;
        }

        const result = await this.request<IPaginatedResponse<TMember>>(this.urls.members, params);

        return result;
    };
}

export const governanceService = new GovernanceService();
