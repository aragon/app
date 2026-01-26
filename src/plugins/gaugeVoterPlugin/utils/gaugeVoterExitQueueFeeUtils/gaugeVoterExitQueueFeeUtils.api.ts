import type { IGaugeVoterExitQueueTicket } from '../../types/gaugeVoterExitQueueTicket';

export interface ICalculateFeeAtTimeParams {
    /**
     * Time elapsed since the ticket was queued (in seconds).
     */
    timeElapsed: number;
    /**
     * The ticket containing fee parameters.
     */
    ticket: IGaugeVoterExitQueueTicket;
}

export interface IGetChartDataPointsParams {
    /**
     * The ticket containing fee parameters.
     */
    ticket: IGaugeVoterExitQueueTicket;
    /**
     * Current timestamp (in seconds).
     */
    currentTime: number;
    /**
     * Number of data points to generate for the chart.
     */
    pointCount?: number;
}

export interface IChartDataPoint {
    /**
     * Time elapsed since queueing expressed in seconds.
     */
    elapsedSeconds: number;
    /**
     * Fee percentage (0-100) at the elapsed timestamp.
     */
    feePercent: number;
}

export interface ICalculateReceiveAmountParams {
    /**
     * Total locked amount (in wei).
     */
    lockedAmount: bigint;
    /**
     * Fee percentage (0-100).
     */
    feePercentage: number;
}
