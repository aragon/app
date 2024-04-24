import type { IRequestParams } from '../aragonBackendService';

export interface IGetDaoUrlParams {
    slug: string;
}

export interface IGetDaoParams extends IRequestParams<IGetDaoUrlParams, undefined> {}
