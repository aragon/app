import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import { smartContractService } from '../smartContractService';
import type { IAllowedAction } from './domain';
import type { IGetAllowedActionsParams } from './executeSelectorsService.api';

class ExecuteSelectorsService extends AragonBackendService {
    private urls = {
        allowedActions: '/execute-selectors/:network/:pluginAddress',
    };

    getAllowedActions = async (params: IGetAllowedActionsParams): Promise<IPaginatedResponse<IAllowedAction>> => {
        const result = await this.request<IPaginatedResponse<IAllowedAction>>(this.urls.allowedActions, params);
        result.data = await Promise.all(
            result.data.map(async (allowedAction) => {
                const abi = await smartContractService.getAbi({
                    urlParams: {
                        network: allowedAction.network,
                        address: allowedAction.target,
                    },
                });

                return {
                    ...allowedAction,
                    targetAbi: abi,
                };
            }),
        );

        return result;
    };
}

export const executeSelectorsService = new ExecuteSelectorsService();
