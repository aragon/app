import type { IPaginatedRequest } from '@/shared/api/aragonBackendService';
import type { Network } from '@/shared/api/daoService';
import type { IRequestUrlQueryParams } from '@/shared/api/httpService';
import type { IEpochStats, IGauge } from './domain';

export interface IGetGaugeListUrlParams {
    /**
     * Address of the user to retrieve the user-specific data for the gauges.
     */
    userAddress: string;
}

export interface IGetGaugeListQueryParams extends IPaginatedRequest {
    /**
     * Address of the plugin to fetch the gauges for.
     */
    pluginAddress: string;
    /**
     * Network of the plugin.
     */
    network: Network;
}

export interface IGetGaugeListParams extends IRequestUrlQueryParams<IGetGaugeListUrlParams, IGetGaugeListQueryParams> {}

export interface IGetGaugeListResult {
    /**
     * List of gauges.
     */
    gauges: IGauge[];
    /**
     * Epoch statistics.
     */
    metrics: IEpochStats;
}
