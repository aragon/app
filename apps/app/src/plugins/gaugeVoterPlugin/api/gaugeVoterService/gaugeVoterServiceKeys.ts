import type {
    IGetEpochMetricsParams,
    IGetGaugeListParams,
    IGetGaugeRewardDistributionParams,
    IGetRewardDistributionParams,
} from './gaugeVoterService.api';

export enum GaugeVoterServiceKey {
    GAUGES = 'GAUGES',
    EPOCH_METRICS = 'EPOCH_METRICS',
    REWARD_DISTRIBUTION = 'REWARD_DISTRIBUTION',
    GAUGE_REWARD_DISTRIBUTION = 'GAUGE_REWARD_DISTRIBUTION',
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
    rewardDistribution: (params: IGetRewardDistributionParams) => [
        GaugeVoterServiceKey.REWARD_DISTRIBUTION,
        params,
    ],
    gaugeRewardDistribution: (params: IGetGaugeRewardDistributionParams) => [
        GaugeVoterServiceKey.GAUGE_REWARD_DISTRIBUTION,
        params,
    ],
};
