import type { IGetAllowedActionsParams } from './executeSelectorsService.api';

export enum ExecuteSelectorsServiceKey {
    ALLOWED_ACTIONS = 'ALLOWED_ACTIONS',
}

export const executeSelectorsServiceKeys = {
    allowedActions: (params: IGetAllowedActionsParams) => [
        ExecuteSelectorsServiceKey.ALLOWED_ACTIONS,
        params,
    ],
};
