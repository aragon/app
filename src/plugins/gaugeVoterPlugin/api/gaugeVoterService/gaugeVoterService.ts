import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IGauge, IGaugePlugin } from './domain';
import type { IGetGaugeListParams, IGetGaugePluginParams } from './gaugeVoterService.api';

class GaugeVoterService extends AragonBackendService {
    private urls = {
        gaugePlugin: '/v2/plugins/by-dao/:network/:daoAddress',
        gauges: '/v2/gauge/:pluginAddress/:network',
    };

    /**
     * Fetches the gauge plugin metadata for a specific DAO.
     * Returns the plugin installation info including addresses, permissions, etc.
     */
    getGaugePlugin = async (params: IGetGaugePluginParams): Promise<IGaugePlugin> => {
        const result = await this.request<IGaugePlugin[]>(this.urls.gaugePlugin, params);

        // Backend returns an array, we expect a single plugin
        if (!result || result.length === 0) {
            throw new Error('No gauge plugin found for this DAO');
        }

        return result[0];
    };

    /**
     * Fetches the list of gauges for a specific plugin.
     * Returns paginated list of gauges with their voting metrics.
     */
    getGaugeList = async (params: IGetGaugeListParams): Promise<IPaginatedResponse<IGauge>> => {
        const result = await this.request<IPaginatedResponse<IGauge>>(this.urls.gauges, params);
        return result;
    };
}

export const gaugeVoterService = new GaugeVoterService();
