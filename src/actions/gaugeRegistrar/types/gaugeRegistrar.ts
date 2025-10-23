import type { GaugeIncentiveType } from './enum/gaugeIncentiveType';

export interface IRegisteredGauge {
    /////////////////////////////////////////
    // DATA FROM GaugeRegistrar CONTRACT
    /////////////////////////////////////////
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
    /////////////////////////////////////////
    // DATA FROM BACKEND API
    /////////////////////////////////////////
    /**
     * Name of the gauge.
     */
    name: string;
    /**
     * Descriptions of the gauge.
     */
    description: string;
    /**
     * Gauge avatar URL.
     */
    avatar?: string;
}
