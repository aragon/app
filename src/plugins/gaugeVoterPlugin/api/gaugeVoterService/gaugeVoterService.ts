import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IEpochMetrics, IGauge } from './domain';
import type { IGetEpochMetricsParams, IGetGaugeListParams } from './gaugeVoterService.api';

class GaugeVoterService extends AragonBackendService {
    private readonly urls = {
        gauges: '/v2/gauge/:pluginAddress/:network',
        epochMetrics: '/v2/gauge/epochMetrics/:pluginAddress/:network',
    };

    /**
     * Fetches the list of gauges for a specific plugin.
     * Returns paginated list of gauges with their voting metrics.
     */
    getGaugeList = async (params: IGetGaugeListParams): Promise<IPaginatedResponse<IGauge>> => {
        const result = await this.request<IPaginatedResponse<IGauge>>(this.urls.gauges, params);
        return result;
    };

    /**
     * Fetches epoch-level metrics for the gauge list.
     * Returns metadata about the current voting epoch including voting period status,
     * end time, and total votes.
     */
    getEpochMetrics = async (params: IGetEpochMetricsParams): Promise<IEpochMetrics> => {
        const result = await this.request<IEpochMetrics>(this.urls.epochMetrics, params);
        return result;
    };
}

export const gaugeVoterService = new GaugeVoterService();
