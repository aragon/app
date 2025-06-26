import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IMemberLock } from './domain';
import type { IGetMemberLocksParams } from './tokenService.api';

class TokenService extends AragonBackendService {
    private urls = {
        memberLocks: '/v1/members/:address/locks',
    };

    getMemberLocks = async (params: IGetMemberLocksParams): Promise<IPaginatedResponse<IMemberLock>> => {
        const result = await this.request<IPaginatedResponse<IMemberLock>>(this.urls.memberLocks, params);

        return result;
    };
}

export const tokenService = new TokenService();
