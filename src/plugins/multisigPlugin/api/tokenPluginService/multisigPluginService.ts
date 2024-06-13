import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IMultisigMember } from './domain';
import type { IGetMultisigMemberListParams } from './multisigPluginService.api';

class MultisigPluginService extends AragonBackendService {
    private urls = {
        members: '/daos/:slug/members',
    };

    getMultisigMemberList = async (
        params: IGetMultisigMemberListParams,
    ): Promise<IPaginatedResponse<IMultisigMember>> => {
        const result = await this.request<IPaginatedResponse<IMultisigMember>>(this.urls.members, params);

        return result;
    };
}

export const multisigPluginService = new MultisigPluginService();
