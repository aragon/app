import type { IGetEfpStatsParams } from './efpService.api';

export enum EfpServiceKey {
    EFP = 'EFP',
}

export const efpServiceKeys = {
    stats: (params: IGetEfpStatsParams) => [EfpServiceKey.EFP, params],
};
