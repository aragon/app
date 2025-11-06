import type { IToken } from '@/modules/finance/api/financeService';

export interface ITokenExitQueueFeeCalculationProps {
    /**
     * Total locked token amount (in wei).
     */
    lockedAmount: bigint;
    /**
     * Fee amount to be deducted (in wei).
     */
    feeAmount: bigint;
    /**
     * Token information for display.
     */
    token: IToken;
    /**
     * Optional help text to display below the calculation.
     */
    helpText?: string;
    /**
     * Optional CSS class name for styling.
     */
    className?: string;
}
