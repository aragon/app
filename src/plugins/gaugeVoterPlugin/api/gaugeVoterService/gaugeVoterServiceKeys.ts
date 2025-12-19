import type {
    IGetEpochMetricsParams,
    IGetGaugeListParams,
} from './gaugeVoterService.api';

export enum GaugeVoterServiceKey {
    GAUGES = 'GAUGES',
    EPOCH_METRICS = 'EPOCH_METRICS',
}

export const gaugeVoterServiceKeys = {
    gauges: (params: IGetGaugeListParams) => [
        GaugeVoterServiceKey.GAUGES,
        params,
    ],
    epochMetrics: (params: IGetEpochMetricsParams) => [
        GaugeVoterServiceKey.EPOCH_METRICS,
        params,
    ],
};
