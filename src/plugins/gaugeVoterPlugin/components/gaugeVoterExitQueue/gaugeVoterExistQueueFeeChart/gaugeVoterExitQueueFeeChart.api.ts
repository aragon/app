import type { IGaugeVoterExitQueueTicket } from '../../../types/gaugeVoterExitQueueTicket';

export const CHART_POINT_COUNT = 50;

export interface IGaugeVoterExitQueueFeeChartProps {
    /**
     * The ticket containing fee parameters for chart generation.
     */
    ticket: IGaugeVoterExitQueueTicket;
    /**
     * Current timestamp (in seconds) for "Now" indicator positioning.
     */
    currentTime: number;
    /**
     * Optional CSS class name for styling.
     */
    className?: string;
}
