import type { Hex } from 'viem';
import type { Network } from '@/shared/api/daoService';
import type { IRequestUrlQueryParams } from '@/shared/api/httpService';

export interface IGetTokenRewardDistributionUrlParams {
    /**
     * Token voting governance plugin address.
     */
    pluginAddress: Hex;
    /**
     * Network of the DAO.
     */
    network: Network;
}

export interface IGetTokenRewardDistributionQueryParams {
    /**
     * Total amount to distribute in wei.
     */
    rewardTotalAmount: string;
    /**
     * ISO date string (e.g. "2026-01-15"). Backend includes proposals
     * with endDate >= lookbackDate and endDate <= now.
     */
    lookbackDate: string;
}

export interface IGetTokenRewardDistributionParams
    extends IRequestUrlQueryParams<
        IGetTokenRewardDistributionUrlParams,
        IGetTokenRewardDistributionQueryParams
    > {}
