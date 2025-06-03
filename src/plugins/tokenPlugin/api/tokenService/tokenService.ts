import type { ITokenLock } from '@/plugins/tokenPlugin/api/tokenService/domain/tokenLock';
import type { IGetTokenLocksParams } from '@/plugins/tokenPlugin/api/tokenService/tokenService.api';
import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';

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
