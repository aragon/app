import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IMemberLock } from './domain';
import type { IGetMemberLocksParams } from './tokenService.api';

class TokenService extends AragonBackendService {
    private urls = {
        memberLocks: '/v2/members/:address/locks',
    };

    getMemberLocks = async (params: IGetMemberLocksParams): Promise<IPaginatedResponse<IMemberLock>> => {
        return this.request<IPaginatedResponse<IMemberLock>>(this.urls.memberLocks, params);
    };
}

export const tokenService = new TokenService();
