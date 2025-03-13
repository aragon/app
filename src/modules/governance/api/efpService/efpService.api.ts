import type { IRequestUrlParams } from '@/shared/api/httpService';

export interface IGetEfpStatsUrlParams {
    /**
     * Address of the EFP user.
     */
    address: string;
}

export interface IGetEfpStatsParams extends IRequestUrlParams<IGetEfpStatsUrlParams> {}
