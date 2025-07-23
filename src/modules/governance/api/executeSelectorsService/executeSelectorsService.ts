import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IAllowedAction } from './domain';
import type { IGetAllowedActionsParams } from './executeSelectorsService.api';

class ExecuteSelectorsService extends AragonBackendService {
    private urls = {
        allowedActions: '/execute-selectors/:network/:pluginAddress',
    };

    getAllowedActions = async (params: IGetAllowedActionsParams): Promise<IPaginatedResponse<IAllowedAction>> => {
        const result = await this.request<IPaginatedResponse<IAllowedAction>>(this.urls.allowedActions, params);

        return result;
    };
}

export const executeSelectorsService = new ExecuteSelectorsService();
