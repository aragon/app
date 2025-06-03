import type { IMemberLock } from "@/plugins/tokenPlugin/api/tokenService/domain/memberLock";
import type { IGetMemberLocksParams } from "@/plugins/tokenPlugin/api/tokenService/tokenService.api";
import { AragonBackendService, type IPaginatedResponse } from "@/shared/api/aragonBackendService";

class TokenService extends AragonBackendService {
  private urls = {
     memberLocks: '/members/:address/locks',
  }

      getMemberLocks = async (
          params: IGetMemberLocksParams,
      ): Promise<IPaginatedResponse<IMemberLock>> => {
          const result = await this.request<IPaginatedResponse<IMemberLock>>(this.urls.memberLocks, params);
          return result;
      };
}

export const tokenService = new TokenService();
