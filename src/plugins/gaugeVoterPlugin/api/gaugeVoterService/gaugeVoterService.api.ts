import type { Hex } from 'viem';
import type { IPaginatedRequest } from '@/shared/api/aragonBackendService';
import type { Network } from '@/shared/api/daoService';
import type { IRequestUrlQueryParams } from '@/shared/api/httpService';

export interface IGetGaugeListUrlParams {
    /**
     * GaugeVoter plugin address.
     */
    pluginAddress: Hex;
    /**
     * Network of the DAO.
     */
    network: Network;
}

export interface IGetGaugeListQueryParams extends IPaginatedRequest {
    /**
     * Filter by status. Returns all gauges if status not set.
     */
    status?: 'active' | 'inactive';
}

export interface IGetGaugeListParams
    extends IRequestUrlQueryParams<
        IGetGaugeListUrlParams,
        IGetGaugeListQueryParams
    > {}

export interface IGetEpochMetricsUrlParams {
    /**
     * GaugeVoter plugin address.
     */
    pluginAddress: Hex;
    /**
     * Network of the DAO.
     */
    network: Network;
}

export interface IGetEpochMetricsQueryParams {
    /**
     * Optional member address to fetch user-specific voting power.
     */
    memberAddress?: Hex;
}

export interface IGetEpochMetricsParams
    extends IRequestUrlQueryParams<
        IGetEpochMetricsUrlParams,
        IGetEpochMetricsQueryParams
    > {}
