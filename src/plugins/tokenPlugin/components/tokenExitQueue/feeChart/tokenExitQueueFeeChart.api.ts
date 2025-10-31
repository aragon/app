import type { ITokenExitQueueTicket } from '../../../types';

export interface ITokenExitQueueFeeChartProps {
    /**
     * The ticket containing fee parameters for chart generation.
     */
    ticket: ITokenExitQueueTicket;
    /**
     * Current timestamp (in seconds) for "Now" indicator positioning.
     */
    currentTime: number;
    /**
     * Optional CSS class name for styling.
     */
    className?: string;
}
