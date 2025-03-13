import type { IGetEfpStatsParams } from './efpService.api';

export enum EfpServiceKey {
    STATS = 'STATS',
}

export const efpServiceKeys = {
    stats: (params: IGetEfpStatsParams) => [EfpServiceKey.STATS, params],
};
