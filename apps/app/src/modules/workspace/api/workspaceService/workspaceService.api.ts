import type { IRequestUrlParams } from '@/shared/api/httpService';

export interface IGetWorkspaceUrlParams {
    /**
     * ID of the workspace to be fetched.
     */
    id: string;
}

export interface IGetWorkspaceParams
    extends IRequestUrlParams<IGetWorkspaceUrlParams> {}
