import type { ILockToVoteTicket } from '../../types';

export interface ILockToVoteFeeChartProps {
    /**
     * The ticket containing fee parameters for chart generation.
     */
    ticket: ILockToVoteTicket;
    /**
     * Current timestamp (in seconds) for "Now" indicator positioning.
     */
    currentTime: number;
    /**
     * Optional CSS class name for styling.
     */
    className?: string;
}
