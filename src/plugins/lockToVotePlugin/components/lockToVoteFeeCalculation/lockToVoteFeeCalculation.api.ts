import type { IToken } from '@/modules/finance/api/financeService';

export interface ILockToVoteFeeCalculationProps {
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
     * Optional CSS class name for styling.
     */
    className?: string;
}
