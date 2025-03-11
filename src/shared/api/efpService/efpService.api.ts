import type { IRequestUrlParams } from '../httpService';

export interface EfpStats {
    followers_count: number;
    following_count: number;
}

export interface IGetEfpStatsUrlParams {
    /**
     * Address of the EFP user.
     */
    address: string;
}

export interface IGetEfpStatsParams extends IRequestUrlParams<IGetEfpStatsUrlParams> {}
