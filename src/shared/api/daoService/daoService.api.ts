import type { IRequestUrlParams } from '../aragonBackendService';

export interface IGetDaoUrlParams {
    /**
     * Slug of the DAO to be fetched.
     */
    slug: string;
}

export interface IGetDaoParams extends IRequestUrlParams<IGetDaoUrlParams> {}
