import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { ITokenMember } from './domain';
import type { IGetTokenMemberListParams } from './tokenPluginService.api';

class TokenPluginService extends AragonBackendService {
    private urls = {
        members: '/daos/:slug/members',
    };

    getTokenMemberList = async (params: IGetTokenMemberListParams): Promise<IPaginatedResponse<ITokenMember>> => {
        const result = await this.request<IPaginatedResponse<ITokenMember>>(this.urls.members, params);

        return result;
    };
}

export const tokenPluginService = new TokenPluginService();
