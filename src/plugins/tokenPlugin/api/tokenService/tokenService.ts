import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { ITokenLock } from './domain';
import type { IGetTokenLocksParams } from './tokenService.api';

class TokenService extends AragonBackendService {
    private urls = {
        memberLocks: '/members/:address/locks',
    };

    getTokenLocks = async (params: IGetTokenLocksParams): Promise<IPaginatedResponse<ITokenLock>> => {
        const result = await this.request<IPaginatedResponse<ITokenLock>>(this.urls.memberLocks, params);
        return result;
    };
}

export const tokenService = new TokenService();
