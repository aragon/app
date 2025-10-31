import type { IGetEpochMetricsParams, IGetGaugeListParams, IGetGaugePluginParams } from './gaugeVoterService.api';

export enum GaugeVoterServiceKey {
    GAUGE_PLUGIN = 'GAUGE_PLUGIN',
    GAUGES = 'GAUGES',
    EPOCH_METRICS = 'EPOCH_METRICS',
}

export const gaugeVoterServiceKeys = {
    gaugePlugin: (params: IGetGaugePluginParams) => [GaugeVoterServiceKey.GAUGE_PLUGIN, params],
    gauges: (params: IGetGaugeListParams) => [GaugeVoterServiceKey.GAUGES, params],
    epochMetrics: (params: IGetEpochMetricsParams) => [GaugeVoterServiceKey.EPOCH_METRICS, params],
};
