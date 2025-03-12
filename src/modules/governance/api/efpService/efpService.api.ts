import type { IRequestUrlParams } from '@/shared/api/httpService';

export interface EfpStats {
    /**
     * Number of addresses that follow the member.
     */
    followers_count: number;
    /**
     * Number of addresses the member is following.
     */
    following_count: number;
}

export interface IGetEfpStatsUrlParams {
    /**
     * Address of the EFP user.
     */
    address: string;
}

export interface IGetEfpStatsParams extends IRequestUrlParams<IGetEfpStatsUrlParams> {}
