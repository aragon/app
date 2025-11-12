import type { IGauge } from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService/domain';
import type { GaugeIncentiveType } from './enum/gaugeIncentiveType';

/**
 *  Gauge data merged from GaugeRegistrar and GaugeVoter contracts.
 */
export interface IRegisteredGauge extends IGauge {
    /**
     * The deterministic address of the gauge
     */
    gaugeAddress: string;
    /**
     * The address of the market's qiToken (e.g. qiAVAX, qiUSDC)
     */
    qiToken: string;
    /**
     * The incentive type (Supply or Borrow)
     */
    incentive: GaugeIncentiveType;
    /**
     * The specific reward controller contract for this gauge
     */
    rewardController: string;
}
