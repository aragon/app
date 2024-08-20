import type { IRequestUrlParams } from '../aragonBackendService';

export interface IGetDaoUrlParams {
    /**
     * ID of the DAO to be fetched.
     */
    id: string;
}

export interface IGetDaoParams extends IRequestUrlParams<IGetDaoUrlParams> {}

export interface IGetDaoSettingsUrlParams {
    /**
     * ID of the DAO to fetch the settings for.
     */
    daoId: string;
}

export interface IGetDaoSettingsParams extends IRequestUrlParams<IGetDaoSettingsUrlParams> {}
